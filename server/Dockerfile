# syntax=docker/dockerfile:1

# Build stage: compile TypeScript into ./build
FROM node:20-alpine AS build
WORKDIR /app

# 1) Install deps needed for build
COPY package.json package-lock.json ./
RUN npm ci

# 2) Copy source and assets (assets are expected to be precompiled)
COPY . .

# 3) Compile server
RUN npm run build

# Runtime stage: smaller image with prod deps only
FROM node:20-alpine AS runtime
WORKDIR /app

# 4) Install production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 5) Copy compiled server and precompiled assets
COPY --from=build /app/build ./build
COPY --from=build /app/assets ./assets

# Azure Container Apps sets PORT at runtime
ENV NODE_ENV=production
EXPOSE 8000

# 6) Start the server
CMD ["node", "build/index.js"]
