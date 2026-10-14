# SERAG OS repository instructions

Read and follow the root `AGENTS.md` and the relevant `docs/` document before making changes.

Keep the existing vanilla JavaScript + Vercel API + Supabase architecture. Prefer focused improvements to a framework rewrite. Use only free development tooling unless the owner explicitly authorizes costs; do not enable paid model calls in the app.

Preserve server-only admin credentials, bearer-token verification, owner UUID checks, RLS, private attachment access, revision conflict handling, and per-account drafts. Never request production secrets in chat or commit them.

English practice belongs in one shared journey with spaced recognition and typed recall. Preserve existing progress and review scheduling.

Run `npm ci --ignore-scripts` and `npm test`. For UI changes also verify the actual shell entry point and a mobile viewport using safe preview fixtures. Describe what was tested and any limitations in the PR.
