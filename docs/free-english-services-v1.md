# Free English resources and ready speech — build 85

## Available without external accounts

- Published curriculum MP3s generated with the existing Kokoro q8 model, US Heart voice. `assets/english-audio/catalog.json` maps exact public word/sentence text to same-origin files. Ready audio is the default for users without an existing natural-voice preference; unknown text falls back to device speech. Existing natural preferences remain supported.
- An attributed local Wiktionary dictionary snapshot for 270 curriculum terms, followed by the existing DictionaryAPI service and a FreeDictionaryAPI.com fallback. Misses are not fabricated. Data is CC BY-SA 4.0, with original Wiktionary links and provider/license credit shown per result.
- Tatoeba live English–Arabic example search and Datamuse related-word search in English → Words & Practice → Vocabulary / Sentence library. Examples retain source/contributor/license metadata. Related words are suggestions, not answer keys. These sources never automatically become scored questions or modify learning history.
- The existing 12,574-pair local sentence explorer remains available and gains Listen controls through the same audio facade used by EngoPlay.

The dictionary snapshot and ready recordings are public curriculum material, not account data. The service worker remains icon-only. Only the public, fixed MP3 directory gains immutable CDN/browser cache headers. Private API speech is authenticated and no-store; its bounded in-memory cache is cleared when accounts change. Online speech is opt-in and clearly explains that text is sent to the selected provider.

## Voice adapters requiring account setup

`GET /api/english-speech?mode=status` returns provider names and configured booleans, never keys. The current project has no voice credentials configured. Code support is not the same as a live external account.

Configure secrets in Vercel project environment settings; never paste or commit values. Each adapter requires an explicit enable/free-plan assertion as well as credentials:

| Provider | Required server variables | Additional requirement |
|---|---|---|
| Azure | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `AZURE_SPEECH_FREE_TIER=F0` | Create an actual F0 resource; the flag does not change the resource tier. Uses the existing quota/auth flow. |
| VoiceRSS | `VOICERSS_API_KEY`, `VOICERSS_FREE_PLAN=true` | Obtain an actual free account. Check usage/redistribution terms. |
| Google | `GOOGLE_TTS_API_KEY`, `GOOGLE_TTS_FREE_QUOTA_CONFIRMED=true` | Requires billing and enforced provider quotas set within the free allowance. No billing account is created or enabled by this implementation. |
| Kokoro server | `KOKORO_TTS_URL`, `KOKORO_TTS_ENABLED=true`, optional `KOKORO_TTS_API_KEY` | Deploy your own HTTPS OpenAI-compatible speech endpoint. Server hosting is not automatically free. |
| Piper server | `PIPER_TTS_URL`, `PIPER_TTS_ENABLED=true`, optional `PIPER_TTS_API_KEY` | Deploy your own HTTPS Piper HTTP endpoint and review the selected voice's license. |

Redeploy after configuration. Unconfigured choices are disabled in the voice picker; the UI never claims they are active. A configured online voice still verifies the signed-in user and consumes the existing database TTS quota before conversion. No arbitrary client-supplied upstream URL, provider chain, secret disclosure or new paid service is introduced. A failure returns to device speech rather than trying another billable-capable provider.

The owner confirmed there are currently no Azure/VoiceRSS accounts, so this release activates the account-free paths and leaves these adapters unconfigured. Deprecated Cloudflare MeloTTS and noncommercial-only free ElevenLabs are not added.

## Data operations

- `node scripts/build-english-dictionary.mjs` refreshes the bounded dictionary subset from FreeDictionaryAPI.com. It processes three public terms per batch with spacing; do not repeatedly rerun it against the provider's 1,000/IP/hour limit. Cached successful entries are retained.
- `node scripts/generate-english-audio.mjs` generates the public deck's words plus the 40 expansion sentences using the installed Kokoro runtime, then encodes MP3s using ffmpeg. Requires network access for model preparation, CPU resources and ffmpeg. Generation is a separate maintenance task, not a Vercel request/build step. Existing catalog entries are resumed.
- `--uk` generates British Emma recordings separately; absent accent/text combinations fall back to device speech. `--list` lists public target texts without generation.
- Some cloud environments require `NODE_USE_ENV_PROXY=1` for downloads. Preserve the supplied proxy and CA settings; do not disable TLS verification.
- `DATAMUSE_API_KEY` is optional now and supported for Datamuse's announced February 2027 authentication change. Public lookups are bounded, use fixed upstream hosts/timeouts, cache successful public responses and return recoverable errors.
- Kaikki/Wiktionary is linked as a source for broader dictionary data; this release does not download its entire multi-million-entry corpus into the browser. The selected dictionary snapshot provides Wiktionary data through FreeDictionaryAPI.com.

## Evidence and limitations

Node tests cover provider configuration, no secret disclosure, identity/quota ordering, non-audio failures, resource query validation/attribution, dictionary fallback/offline data and ready-audio/device routing. Chromium fixture checks exercise the actual local API handlers, ready MP3 playback, live Datamuse/Tatoeba results, visible dictionary attribution, voice settings and a 393px layout. Fixture account operations use the existing mock Supabase adapter.

Generated audio is checked as MP3 and a sample is played through Chromium; no human listening score is claimed. No external account, key, payment method or server was created. Third-party content quality and uptime are not guaranteed; no CEFR accreditation or automatic exam quality is claimed. Live external-provider synthesis and real-account cross-device verification remain dependent on the owner's accounts and devices.

Sources: [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M), [FreeDictionaryAPI](https://freedictionaryapi.com/), [Tatoeba attribution](https://en.wiki.tatoeba.org/articles/show/faq), [Datamuse](https://www.datamuse.com/api/), [Azure](https://azure.microsoft.com/en-us/pricing/details/speech/), [VoiceRSS](https://www.voicerss.org/pricing/), [Google TTS](https://cloud.google.com/text-to-speech/pricing), [Piper](https://github.com/OHF-Voice/piper1-gpl).
