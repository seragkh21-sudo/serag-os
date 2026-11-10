# Interactive Video Studio

Goal: study Arabic or English YouTube videos in Listen & Speak with timed captions, vocabulary lookup and saving, grammar/context explanations, translation, dictation and account-scoped local playback checkpoints.

Uses the existing Video Studio and dictionary. API analysis reuses the existing authenticated AI gateway model and atomic english-coach quota. No browser framework or database migration. Imported captions remain local to the account's Academy state. Vocabulary writes use the current user's bearer-backed Supabase client and existing RLS.

Automatic captions require SUPADATA_API_KEY configured in Vercel for preview/production. Get transcript requests native captions only. Generate transcript explicitly uses provider credits. Private/restricted/live videos may be unavailable. Async jobs are signed, owner-scoped and resumable for one hour; credentials never reach the browser. Arabic source audio is not presented as English listening audio. Analysis is generated on request, cached locally, and may be inaccurate when source captions contain errors.

Validation: existing Video Studio unit tests plus new API input/auth/job-isolation tests. Browser smoke checks should verify caption import, word lookup, grammar/translation, vocabulary save, playback resume, mobile overflow and account changes. A missing provider key returns a clear setup response and SRT/VTT remains usable. Actual provider and AI quality must be verified with configured services; mocked tests do not prove real transcript availability.
