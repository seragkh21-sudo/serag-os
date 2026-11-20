# Practice repetition repair — 20 November 2026

Task: normal English/EngoPlay practice should consume unseen eligible content before repeating recently solved material; preserve account history and deliberate review.

Source inspection found due-first ordering in both grammar and vocabulary, a 24-hour-only exclusion, a local seen index that expired after seven days, bounded remote history reads, and a sentence-builder route that chose two examples before shared selection. The home Next handler bypassed shared selection and excluded four-option questions. The legacy quiz remembered only ten previous keys. Both advanced batches are loaded and injected into the academy source; missing advanced content was not the primary cause.

Decision: use the shared normalized prompt/answer identity for lifetime unseen-first selection, then oldest-first rotation with existing cooldown/review constraints. Never pad an unseen batch with repeats. Apply exhaustion across mixed exercise families so a smaller builder bank cannot start repeating while grammar remains unused. Explicit review/selected words and intentional within-session recall are retained. Page owner-scoped history completely and retain local seen timestamps; no data reset or schema changes.

Implementation: shared practice state, academy, word journey, EngoPlay history/daily routing, quest adapter, legacy quiz and home quiz. Build 90 synchronizes entry/worker/fixture versions. Update the existing vocabulary validation to recognize the already-published Grammar & Everyday category; baseline failed that assertion before this change.

Verification: Node 24 full suite; focused multi-day, alias, reload, added-content, mixed-family and pagination regressions. Audit production-loaded source bank coverage. Use the safe fixture for browser interaction checks, then verify the production deployment/served files after publishing. No independent Goldfish review is claimed.
