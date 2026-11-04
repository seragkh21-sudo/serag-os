# EngoPlay open-source integration stages

## Stage 1 — native exercise formats (implemented)

`engoplay-open-interactions-v1.js` adds two formats to the existing vanilla-JS journey:

- Matching four English expressions with their meanings.
- Correcting a deliberately incorrect grammar sentence, using a real EngoPlay grammar item.

The exercise data comes from EngoPlay's existing vocabulary and grammar banks. The adapter and UI are original project code; nothing is fetched from Duolingo, and no user account data or external API is involved. Matching results are saved through the existing account-scoped activity and local review state. A round with a wrong pair is recorded as assisted practice, not as independent recall.

Open references reviewed for this stage:

- [`digas99/duo-explained`](https://github.com/digas99/duo-explained) (MIT): its public exercise-type documentation informed the decision to support varied interaction formats. Its proprietary-service parser and extension code are not imported.
- [`h5p/h5p-blanks`](https://github.com/h5p/h5p-blanks) and [`h5p/h5p-drag-text`](https://github.com/h5p/h5p-drag-text) (MIT): useful fill-in and word-selection references. Their H5P runtime/editor stack is not part of this static app, so the feature is implemented natively instead of vendoring an unused plugin.

## Stage 2 — spaced review (planned)

[`open-spaced-repetition/ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) (MIT) is a candidate scheduler. Before enabling it, add an additive migration for its review state, keep the current interval columns readable for existing cards, test old-row fallback and account isolation, and confirm the browser bundle works with the app's deployment CSP. No scheduler source has been copied or activated yet.

## Reviewed but not imported

- [`jmbeach/duolingo-vocab-lists`](https://github.com/jmbeach/duolingo-vocab-lists) and its fork contain third-party course vocabulary but no repository license was declared. The files are excluded until their data rights and provenance can be confirmed.
- Unofficial Duolingo account APIs, extracted lesson banks, user progress, and reverse-engineered parsers are excluded. The project uses its own curriculum, original examples, and openly licensed learning code only.

Each stage is reviewed and tested before its own pull request; this document is a record of sources and scope, not a claim that planned work is already deployed.
