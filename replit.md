# Kaleidoscope AI

Kaleidoscope AI is a secure Groq-powered learning engine that turns a topic into a visual mindmap, everyday analogy, memory rap, and active-recall quiz.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the shared API server
- `pnpm --filter @workspace/kaleidoscope-ai run dev` — run the Kaleidoscope web experience
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secret for generation: `GROQ_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kaleidoscope-ai/public/` — static frontend (`index.html`, `style.css`, `script.js`)
- `artifacts/kaleidoscope-ai/server.js` — standalone Express server for local use
- `artifacts/api-server/src/routes/generate.ts` — shared `/api/generate` route used by the preview proxy
- `artifacts/kaleidoscope-ai/README.md` — local install and start instructions

## Architecture decisions

- Groq is called only from server code; the browser sends topics to a same-origin endpoint and never receives the API key.
- The frontend is deliberately vanilla HTML, CSS, and JavaScript so the hackathon submission remains easy to run with `npm start`.
- The shared API server mirrors the standalone endpoint because the Replit preview proxy reserves `/api` for the API service.
- Groq responses are schema-checked before they reach the browser so malformed model output fails safely.

## Product

- Topic input with Photosynthesis demo prefill and quick suggestions
- Mermaid dark-theme visual mindmap
- Two-sentence analogy and four-line memory rap
- Browser text-to-speech for the rap
- Three-question active-recall quiz with retry-on-wrong behavior

## User preferences

- Keep Groq credentials server-side and never expose them in frontend assets.

## Gotchas

- Add `GROQ_API_KEY` as a Replit Secret before testing real generation; the checked-in `.env.example` is intentionally only a placeholder.
- The app can be run standalone from `artifacts/kaleidoscope-ai` with `npm install && npm start`, or through the managed workspace workflows.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
