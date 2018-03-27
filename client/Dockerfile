FROM node:8.9-slim

ENV HOME=/app/

WORKDIR $HOME

COPY package.json package-lock.json $HOME

RUN npm install

COPY . $HOME

