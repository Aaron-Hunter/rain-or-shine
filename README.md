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

to run frontend go run in `/frontend`
```sh
npm install
npm run dev
```

### Full frontend dev Run
To run everything in the same terminal (without logs) run `./start.sh` -- this allows hot reloading for the frontend

## Docker Compose
We can build the app with docker compose `docker-compose up` 
- not really sure why i wanted to do this other than to play with docker compose... as it does practically the same thing as the `./start.sh` script

- I guess its a good way to test the docker files all build before deployment
  - yup we will go with that... 


## DEPLOYMENT

### 1. In the beginning there was gcloud

login and create project
```bash
gcloud auth login

# AND GCLOUD SAID LET THERE BE LIGHT
gcloud projects create rain-or-shine-nz
```

```bash
# OR IF LIGHT WAS ALREADY THERE... 
gcloud config set project rain-or-shine-nz
```

### 2. Deploy
```bash
./deploy-gcp.sh
```