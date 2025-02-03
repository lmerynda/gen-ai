FROM mcr.microsoft.com/devcontainers/python:1-3.12-bullseye

RUN apt-get update && apt-get install -y \
    zsh \
    docker.io \
    gnupg \
    ca-certificates \
    curl \
    && apt-get clean

RUN chsh -s $(which zsh)
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /workspaces/KnightsOfDarkness
