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

### Full Run
To run everything in the same terminal (without logs) run `./start.sh`