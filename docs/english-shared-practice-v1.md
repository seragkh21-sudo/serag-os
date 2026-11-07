# Shared English practice — build 84

Historical build 84 notes. For the current ready-audio default introduced in build 85, see [Free English resources and ready speech](free-english-services-v1.md). The shared-practice recency contract below remains applicable.

English and EngoPlay read the same academy question bank and vocabulary deck. The original expansion pack contains 64 vocabulary entries with Arabic meanings and natural examples, plus 40 contextual grammar questions across B1–C2. Deduplication adds **47 distinct vocabulary items** to the current production deck (319 → 366); the other entries overlap existing terms. Levels are instructional groupings, not certification.

Daily practice adds the eligible level bank to both advanced batches instead of replacing it with a small pilot. Sentence builders also combine existing and advanced sources. No historical question IDs, answers, XP, streaks or review rows are reset.

## Recency and loading

`english-practice-state-v1.js` gives question aliases a normalized prompt/answer fingerprint. Recent attempts and exposures are shared across entry points, browser reloads and the existing owner-only exposure sync queue. Automatic selection excludes questions/words seen within 24 hours, including old local assisted word attempts. Explicit word selection and explicit mistake review still allow deliberate repetition; delayed recall inside the same vocabulary session remains intentional. When eligible material is exhausted, show an empty state rather than silently recycle recent questions.

New sessions wait for the account's activity, reviews and exposures to load. Failed initial history reads keep practice unready with a retry message. Account changes discard a pending start. Exposure rows are not answers and award no XP. Cross-device recency requires successful synchronization; simultaneous offline devices cannot establish a global ordering.

The existing exposure table and policies are reused; no database migration or new service is required. Recent exposures are fetched newest first. Local cooldown storage is bounded to 6,000 keys / seven days per account. Grammar and vocabulary banks are memoized and invalidated when their source arrays or lengths change; parsed recency maps and shared activity snapshots avoid rebuilding them per candidate.

## Speech

Without a saved preference, speaker buttons use device speech immediately. Existing natural-voice preferences remain intact. Voice settings and the audio bar offer a fast-device option. Natural mode prepares the visible practice sentence while the learner reads, shares an in-flight preparation with a speaker click and keeps a bounded in-memory blob cache (32 chunks, 12 MiB maximum; individual chunks limited to 2 MiB). Replay avoids another inference. Stop/new requests cannot start stale playback; account changes stop jobs, terminate the worker and clear private audio. Prefetch occurs only after a natural-voice preference exists. No new paid API or automatic first-use model download is introduced.

Initial Kokoro download and first inference can still take time, and device speech availability/latency depends on the browser. The verification below does not establish real-device natural inference speed or audio quality.

## Validation

- Node 24 tests cover account isolation, prompt aliases, reload persistence, remote exposures, legacy assisted attempts, exhaustion, explicit revision, delayed/failed history reads, additive content and cache reuse/invalidation, speech cancellation, fast defaults, natural prefetch and cached replay.
- Local Chromium fixture check: start daily practice from English, answer/exit/restart, reload/start again; the first words differ. Shared deck: 366 items. Expansion: 40 live questions. No page errors during the bounded check.
- Mobile fixture viewport: 393 px, no horizontal overflow on the tested practice screen.
- Natural worker production build succeeds. Model generation is tested with worker mocks; real microphone, real-account synchronization and target-device playback are not claimed.
- Production publication is separate from branch/PR validation.
