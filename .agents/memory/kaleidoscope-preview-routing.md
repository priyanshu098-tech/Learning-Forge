---
name: Kaleidoscope preview routing
description: Why the web artifact mirrors its API route in the shared API server.
---

The Replit preview proxy routes `/api` to the shared API-server artifact before the root web artifact, so full-stack web artifacts that use `/api/*` need their server route implemented in the shared API server as well as in any standalone local server.

**Why:** A root web service can render correctly while `/api/*` requests receive a proxy error or are handled by the separate API service.

**How to apply:** Keep the standalone server for direct local use, and mirror any `/api` endpoint in `artifacts/api-server/src/routes/` when the workspace has the shared API service.