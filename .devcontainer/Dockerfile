FROM golang:1.22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git bash \
    zsh git-lfs \
  && rm -rf /var/lib/apt/lists/*

RUN git lfs install

WORKDIR /workspace
