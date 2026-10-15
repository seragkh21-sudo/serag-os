# Working on SERAG OS

Read this file before changing code. Keep changes small and compatible with the existing app. Do not introduce paid services, model calls, subscriptions, or new frameworks without the owner's explicit request.

## Architecture

- Static HTML, CSS, and vanilla browser JavaScript; Vercel Node ESM APIs in `api/`. This is not a React app.
- `index.html` starts `shell-loader.js`, which loads `legacy.html` and injects feature assets. Verify the real entry point when changing the UI.
- Supabase provides authentication, owner-scoped database rows, and private attachments. Shared browser globals include `sb` and `user`.
- Start with `README.md`, `SERAG_OS_PROJECT_BRIEF.md`, and the relevant document under `docs/`.
- Goals and task links: `workflow-v21.js`, `docs/workflow-v21.md`.
- English learning: `engoplay-v19.js`, `word-practice-v21.js`, `docs/learning-journey-v22.md`. Preserve the shared journey: meaning-cued choices, examples, intervening questions, then typed recall. Do not restore a separate Cards section or reset review history.

## Security and user data

- Never commit credentials, read production secrets, or put service-role keys in browser code. Public Supabase publishable keys are not administrative credentials.
- Admin API requests must verify the Supabase bearer token remotely and check the server-side immutable UUID allowlist. Preserve fail-closed behavior and no-store responses; see `docs/admin.md` and `api/admin-users.js`.
- Preserve RLS, owner-folder attachment policies, and per-account local drafts. Signing into the app must not expose another user's files or progress.
- Use additive database migrations and revision checks. Do not overwrite concurrent edits or delete production data to test a feature.
- The service worker caches the icon only. Do not cache authenticated APIs or user data.

## Verification and delivery

- Install dependencies with `npm ci --ignore-scripts`; run `npm test` (Node 24). Tests use mocks and must not require production secrets or paid model calls.
- Use `workspace-preview.html` and its fixture adapter for safe UI checks. Distinguish fixture checks from real-account verification.
- Frontend changes must keep versioned entry-point assets, loader, service worker, and preview consistent. Preserve CSP hashes and existing allowed script sources in `vercel.json`; the header generator can discard external sources, so review its output.
- Do not replace unrelated work. Work on a branch and submit a focused PR with validation and remaining limitations. A passing workflow does not itself configure branch protection.
- Report deployment success only after checking the deployment state. A preview is not proof that production changed.
