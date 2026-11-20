# Shared English practice — build 90

The rotation contract below is current as of build 90. Content totals and speech notes marked as historical describe earlier builds. For the ready-audio default introduced in build 85, see [Free English resources and ready speech](free-english-services-v1.md).

English and EngoPlay read the same academy question bank and vocabulary deck. The original expansion pack contains 64 vocabulary entries with Arabic meanings and natural examples, plus 40 contextual grammar questions across B1–C2. Deduplication adds **47 distinct vocabulary items** to the current production deck (319 → 366); the other entries overlap existing terms. Levels are instructional groupings, not certification.

Daily practice adds the eligible level bank to both advanced batches instead of replacing it with a small pilot. Sentence builders also combine existing and advanced sources. No historical question IDs, answers, XP, streaks or review rows are reset.

## Rotation and loading

Normal automatic practice uses **all unseen eligible questions before repeating any previously attempted or presented questions**. Eligibility is scoped to the chosen level, topic and available exercise sources. A short unseen batch is not padded with reviews. After that pool is exhausted, seen questions rotate oldest first, respecting the minimum 24-hour cooldown and future review schedules. Error/topic ranking cannot bring a recently repeated item ahead of the rest of an exhausted pool. An added content import takes priority over previously seen material.

The mixed journey applies this rule across vocabulary, grammar and sentence builders: an exhausted small exercise family is omitted while another family still has unseen material. Sessions can therefore be shorter. The daily route supplies the entire level-specific existing sentence-builder bank plus advanced builders before selection, rather than preselecting two examples. The home quiz and its Next button use the same selector and include four-option imported questions. The legacy vocabulary quiz also consults lifetime history instead of a ten-answer window.

`english-practice-state-v1.js` gives aliases a normalized prompt/answer fingerprint. Duplicate aliases share a rotation slot even across topics and IDs. The account-scoped local seen index retains old timestamps without a seven-day expiry; the existing owner-only exposure table and offline queue synchronize these timestamps. Local answered/card history and old word-stage activity keys remain usable. Existing question IDs, answers, XP, streaks, cards and review rows are preserved. Presentation itself never awards an answer or XP.

Activity, word reviews and exposure history are loaded in ordered 500-row pages without the former 1,000/2,000-row history caps. The legacy quiz pages its owner-scoped attempt history too. New sessions wait for initial history; a failure on any history page keeps practice unready. Account changes discard a pending start. No schema changes or new services are required. Simultaneous offline devices still cannot establish a global ordering until synchronization succeeds.

Explicit word selection and explicit mistake review allow deliberate repetition. Matching and delayed written recall within a vocabulary session remain intentional. If all eligible repeats are still in cooldown or scheduled for later, show an empty state instead of silently recycling them.

Grammar and vocabulary banks remain memoized and invalidated when source arrays or lengths change; parsed local maps and activity snapshots avoid rebuilding history for each candidate.

## Historical build 84 speech notes

Without a saved preference, speaker buttons use device speech immediately. Existing natural-voice preferences remain intact. Voice settings and the audio bar offer a fast-device option. Natural mode prepares the visible practice sentence while the learner reads, shares an in-flight preparation with a speaker click and keeps a bounded in-memory blob cache (32 chunks, 12 MiB maximum; individual chunks limited to 2 MiB). Replay avoids another inference. Stop/new requests cannot start stale playback; account changes stop jobs, terminate the worker and clear private audio. Prefetch occurs only after a natural-voice preference exists. No new paid API or automatic first-use model download is introduced.

Initial Kokoro download and first inference can still take time, and device speech availability/latency depends on the browser. The verification below does not establish real-device natural inference speed or audio quality.

## Historical build 84 validation

- Node 24 tests cover account isolation, prompt aliases, reload persistence, remote exposures, legacy assisted attempts, exhaustion, explicit revision, delayed/failed history reads, additive content and cache reuse/invalidation, speech cancellation, fast defaults, natural prefetch and cached replay.
- Local Chromium fixture check: start daily practice from English, answer/exit/restart, reload/start again; the first words differ. Shared deck: 366 items. Expansion: 40 live questions. No page errors during the bounded check.
- Mobile fixture viewport: 393 px, no horizontal overflow on the tested practice screen.
- Natural worker production build succeeds. Model generation is tested with worker mocks; real microphone, real-account synchronization and target-device playback are not claimed.
- Production publication is separate from branch/PR validation.

## Build 90 verification

Node 24 regression tests cover full unseen-first rotations across simulated days/reloads, new imports, old prompt aliases, month-old seen state, vocabulary history from another device, full builder coverage, mixed-family exhaustion, four-option home questions and the home Next handler. Pagination tests use 1,201 activity rows and 2,201 exposures, and verify that a later failed page blocks readiness. Explicit review, selected words, delayed recall, session history and owner isolation retain their existing regression coverage.
