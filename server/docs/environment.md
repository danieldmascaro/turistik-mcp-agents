# Environment variables in Node development

Node's official runtime exposes `${process.env}` (https://nodejs.org/api/process.html#processenv) as the canonical place to read environment variables. For local development and testing, it is customary to keep a `.env` file and load it with a tool such as [`dotenv`](https://www.npmjs.com/package/dotenv), which mirrors how the same names will be provided by production platforms.

Steps for our project:

1. Add `import "dotenv/config";` before other imports in `src/index.ts` so local runs populate `process.env` automatically.
2. Move secrets and host-specific settings out of code and into named environment variables.
3. Keep a `.env` (properly ignored in production) that mirrors the variables your service expects; this file allows developers to run the server without copying values manually.

This document can serve as a quick reference for future contributors.
