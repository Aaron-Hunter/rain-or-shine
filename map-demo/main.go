package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-spatial/geom"
	"github.com/go-spatial/geom/encoding/gpkg"
	_ "modernc.org/sqlite"
)

type searchRequest struct {
	Address string `json:"address"`
}

type searchResponse struct {
	Lng float64 `json:"lng"`
	Lat float64 `json:"lat"`
}

var db *sql.DB

const earthRadius = 6378137.0 // meters, Web Mercator sphere

func mercator3857ToWGS84(x, y float64) (lonDeg, latDeg float64) {
	lon := x / earthRadius
	lat := 2*math.Atan(math.Exp(y/earthRadius)) - math.Pi/2
	return lon * 180 / math.Pi, lat * 180 / math.Pi
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req searchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	if db == nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "database not open"})
		return
	}

	// SELECT geom FROM nz_addresses WHERE full_address LIKE '<address>%' LIMIT 3
	like := req.Address + "%"
	var geomBlob []byte
	err := db.QueryRow("SELECT geom FROM nz_addresses WHERE full_address LIKE ? LIMIT 3", like).Scan(&geomBlob)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "address not found"})
		return
	}
	if err != nil {
		log.Printf("search query: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "search failed"})
		return
	}

	sb, err := gpkg.DecodeGeometry(geomBlob)
	if err != nil {
		log.Printf("decode geometry: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid geometry"})
		return
	}

	pts, err := geom.GetCoordinates(sb.Geometry)
	if err != nil || len(pts) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "no coordinates"})
		return
	}
	// First point: XY is [lng, lat] for WGS84
	x, y := pts[0].X(), pts[0].Y()

	lng, lat := mercator3857ToWGS84(x, y)

	json.NewEncoder(w).Encode(searchResponse{Lng: lng, Lat: lat})
}

func main() {
	gpkgPath := os.Getenv("GPKG_PATH")
	if gpkgPath == "" {
		gpkgPath = filepath.Join("..", "map-data", "auckland-addresses.gpkg")
	}
	var err error
	db, err = sql.Open("sqlite", gpkgPath)
	if err != nil {
		log.Fatalf("open gpkg: %v", err)
	}
	defer db.Close()

	http.HandleFunc("/search", searchHandler)
	// Serve static files (index.html, /data/*.json, etc.) from current directory
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	port := "8081"
	if p := os.Getenv("PORT"); p != "" {
		port = p
	}
	log.Printf("Server at http://localhost:%s (GET / for app, POST /search for API)", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
