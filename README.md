# rain-or-shine

To run the demo you need Go and Docker installed.
If you are on Windows you also need CGO working, so you need a gcc compiler installed and added to your PATH (not sure if this is true now we have devcontainer?)

If you are on Windows you need to have wsl and dev containers set up in VS Code
clone/move the repo to a folder in wsl (this README assumes it is in ~/projects)
then open the project in container

Run this in a WSL terminal until I figure out how to make Dev Containers reliably start all services automatically (you will need to close the dev container so the port is free)
```wsl
cd ~/projects/rain-or-shine
docker compose -f .devcontainer/docker-compose.yml up --build
```

you will then need to bring this back down once you're done
```wsl
docker compose -f .devcontainer/docker-compose.yml down
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
