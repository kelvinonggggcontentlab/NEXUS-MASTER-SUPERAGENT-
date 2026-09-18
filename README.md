# NEXUS MASTER SUPERAGENT™

NEXUS is a premium, single-command AI-agent experience for BLACKTOWER™. The current implementation is deliberately runnable without credentials: all integrations operate through explicit **simulation adapters**, and every final response states that no real account was changed.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Use `npm test`, `npm run check`, and `npm run build` for validation.

## Architecture

- `src/core/engine.ts` owns dependency-aware execution, parallel safe-ready tasks, bounded retries, cancellation, validation, permissions, idempotency recovery, execution history, and verification.
- `src/core/registry.ts` dynamically discovers registered adapters. New integrations implement `NexusTool`; they do not modify the core.
- `src/core/planner.ts` is a provider-shaped planning boundary. `HeuristicNexusProvider` is an offline deterministic provider suitable for development; production Gemini/OpenAI providers should implement `NexusAIProvider` on a server boundary.
- `src/core/simulation-tools.ts` contains clearly labelled simulation adapters for Gmail, Drive, and reminders. It must not be used with real credentials.
- `src/core/memory.ts`, `permissions.ts`, and `response.ts` isolate session memory, safety policy, and NEXUS communication.
- `src/server/` is a server-only boundary for configuration and real Google Workspace adapters. It is never imported into the browser bundle. `supabase/schema.sql` defines user-isolated durable execution, conversation, tool-call, and controlled-memory storage.

## Production integrations

Real Google and messaging adapters require server-side OAuth handling and encrypted token storage. Keep these values server-only: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, an AI provider key such as `GEMINI_API_KEY` or `OPENAI_API_KEY`, and a Supabase service key only in a trusted backend. The browser application must receive neither tokens nor service credentials.

Before enabling real mode, replace each simulation adapter with a verified API adapter, implement durable idempotency storage (for uncertain writes), persist execution/memory state in a protected database, and add user authentication plus consent screens.

## Google Drive real mode

`src/server/google-oauth.ts` implements server-only authorization-code OAuth, one-time state consumption, refresh handling, and disconnect. `src/server/google-drive.ts` uses the Google Drive REST API and `createGoogleDriveTools` exposes search, get, rename, and move tools that verify against fresh Drive metadata. Bind the framework-neutral connection handler in `src/server/http-api.ts` to an authenticated server session; never call it from the static client with tokens.

Required server-only variables are `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`. Store Google tokens encrypted at rest in `integration_accounts`; use an application key-management/encryption service, not conversational memory. Real mode cannot be enabled until a server session resolver and the encrypted Supabase repositories for `GoogleConnectionStore` and `OAuthStateStore` are deployed.
