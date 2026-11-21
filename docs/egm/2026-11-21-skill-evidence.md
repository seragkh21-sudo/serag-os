# Skills beyond XP — step 2, build 96

Purpose: distinguish observed recognition, typed recall, grammar/usage choices, sentence ordering and expression-presence checks. Reuse the current engine and preserve all existing attempts, cards, XP, recency and daily goals. Do not infer CEFR or speaking proficiency from choices or transcripts.

`english-skill-evidence-v1.js` records first item/skill/Cairo-day results from direct academy answers and shared word-engine submissions, matching completion and reveals. A failed first attempt cannot be repaired by another same-day answer. A correct answer after a hint, error or assisted prompt is not independent. Mixed grammar answers suppress duplicate academy instrumentation. Prompt/answer fingerprints merge grammar aliases; vocabulary uses the expression identity. No answer text, draft or audio is saved in this new log.

The existing per-account local grammar report remains below the new skills dashboard. Existing grammar answer totals and prior independent word-recall aggregates are shown as history, not retrospectively assigned assistance metadata. Rich evidence begins with this release; existing server rows do not reliably preserve first-attempt/assistance distinctions. This version stores evidence locally per account; it does not add or migrate a Supabase table and does not claim cross-device evidence synchronization. Existing answer/XP synchronization is unchanged.

The log retains up to 2,000 checks within 90 days. Each skill/topic summary uses its latest 20 retained checks, counts independent successes, distinct items and Cairo days. Indicators are custom, transparent practice heuristics:

- No evidence yet: no retained checks.
- Practising: some checks but insufficient consistent evidence.
- Needs review: a supported/incorrect check among the latest three, or over 14 days since the latest check.
- Consistent practice: at least five checks, three different items, two days, at least 80% independent success and no difficulties among the latest three.

Expression-use checks only detect whether the target expression appears in a structurally acceptable answer; they never yield consistent-writing/proficiency status. Listening, pronunciation and free-writing quality remain unmeasured. The dashboard explicitly explains these limits. This is not a calibrated mastery estimator.

Daily cards link to the same dashboard and identify a skill needing review without altering automatic unseen-first selection. Explicit review remains opt-in. Completion offers a skills link. History readiness, owner changes and local persistence failures are represented explicitly; storage failure does not block the existing answer-saving path.

Validation scope: independent recognition vs recall, assistance/retry/reveal, alias/day deduplication, evidence thresholds and staleness, account isolation/reload, malformed storage, failure reporting and engine integration. Fixture browser verification covers actual academy and mixed practice, the dashboard, daily link, reload and mobile layout. No real-account multi-device result or independent Goldfish review is claimed.

The existing short daily round intentionally has no typed vocabulary recall. Its explanatory copy now reflects that. A separate recall-session button uses the existing full word journey and its delayed recall; the daily engine is not lengthened and automatic repeat rules remain unchanged.

Completed checks: 244 Node tests pass; both production bundles build. Local Chromium fixture at 393px verifies a wrong-then-correct academy answer remains 0/1 independent, recognition alone does not increment recall, the separate recall button reaches typed recall, and evidence survives a page reload. No page errors or horizontal overflow in that flow. Live account/multi-device evidence synchronization is not implemented.
