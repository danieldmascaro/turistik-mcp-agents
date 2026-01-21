# Azure Container Apps tutorial (server-only)

This guide assumes you deploy only `server/` and you store compiled UI assets inside
`server/assets/` as `index.js` and `index.css`.

## 1) Prepare assets (outside this repo is fine)

Place the precompiled files here:

- `server/assets/index.js`
- `server/assets/index.css`

The server reads these files at runtime from `server/build -> ../assets`.

## 2) Build the image locally (optional)

From `server/`:

```bash
docker build -t turistik-mcp:local .
```

Run it:

```bash
docker run --rm -p 8000:8000 \
  -e WC_BASE_URL=... \
  -e WC_CONSUMER_KEY=... \
  -e WC_CONSUMER_SECRET=... \
  -e OZY_BASE_URL=... \
  -e OZY_CLIENT_ID=... \
  -e OZY_CLIENT_SECRET=... \
  -e GRANT_TYPE=... \
  -e OZY_SCOPE=... \
  -e SQL_USER=... \
  -e SQL_SECRET=... \
  -e SQL_SERVER=... \
  -e SQL_DATABASE=... \
  turistik-mcp:local
```

## 3) Push the image to a registry

Use Azure Container Registry (ACR) or another registry. Example flow:

```bash
az acr create -n <acrName> -g <rg> --sku Basic
az acr login -n <acrName>
docker tag turistik-mcp:local <acrName>.azurecr.io/turistik-mcp:1
docker push <acrName>.azurecr.io/turistik-mcp:1
```

## 4) Create the Container App

Create a Container App with:

- Ingress: External
- Target port: 8000 (the server uses `PORT` from Azure)
- Environment variables set (same as above)

Example CLI:

```bash
az containerapp create \
  --name <appName> \
  --resource-group <rg> \
  --environment <envName> \
  --image <acrName>.azurecr.io/turistik-mcp:1 \
  --target-port 8000 \
  --ingress external \
  --registry-server <acrName>.azurecr.io
```

Then set env vars:

```bash
az containerapp update \
  --name <appName> \
  --resource-group <rg> \
  --set-env-vars \
  WC_BASE_URL=... \
  WC_CONSUMER_KEY=... \
  WC_CONSUMER_SECRET=... \
  OZY_BASE_URL=... \
  OZY_CLIENT_ID=... \
  OZY_CLIENT_SECRET=... \
  GRANT_TYPE=... \
  OZY_SCOPE=... \
  SQL_USER=... \
  SQL_SECRET=... \
  SQL_SERVER=... \
  SQL_DATABASE=...
```

## 5) Verify

Use the public URL from Azure. The MCP SSE endpoint is:

- `https://<app-url>/mcp`

The POST endpoint is:

- `https://<app-url>/mcp/message?sessionId=...`
