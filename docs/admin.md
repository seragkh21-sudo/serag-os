# Owner dashboard

Sign in through the existing home page, then open `/admin` (Vercel clean URLs).
The page shell is public; all user data is fetched only after server-side authorization.

Set these server-only variables in Vercel for the intended deployment environment:

- `ADMIN_OWNER_IDS`: comma-separated Supabase Auth user UUIDs of trusted owners. Find your exact UUID in Supabase Authentication → Users. There is no first-user or email fallback; an empty allowlist denies everyone.
- `SUPABASE_SERVICE_ROLE_KEY`: the project's service role key. Store as a sensitive Vercel variable. Never put it in HTML, JavaScript, Git, or a public-prefixed variable.

Redeploy after changing variables. Each request verifies the bearer token with the project's `/auth/v1/user` endpoint before comparing the verified ID with the allowlist. User-editable metadata cannot grant access. The Admin API receives the service role credential only on the server, after authorization. Responses contain only ID, email, creation time, email confirmation time and last sign-in time, with no-store caching. No user mutation actions are provided.

Users are paginated (50 per page). The recent-signup panel shows registrations in the last seven days **on the current page**, sorted newest first. It does not claim to summarize all accounts. Verification means email confirmation; users without a last sign-in show a dash.

Run `node --test tests/admin.test.js` for the authorization and response filtering checks.
