# rain-or-shine

To run the demo you need Go and Docker installed.

Run this in a terminal at `/map-demo`
```sh
go mod tidy
go run .
```

then to run the tileserver run this in another terminal in `/map-data`
```sh
docker run --rm -it \
-v "$(pwd)/mbtiles:/data" \
-p 8080:8080 \
maptiler/tileserver-gl:latest
```
