# Guided daily path — step 1

Goal: one clear daily entry point in English and EngoPlay, with an explicit learning aim, existing mixed practice, same-tab resume and a useful result/next action. Preserve banks, recency, history, XP and account isolation. No new model or database service.

Implementation: a shared daily card in both overview/lobby; daily session metadata and an owner/day/level-checked resume API in the word engine; pause returns to overview without discarding that session. The session explains the purpose of its current exercise; completion offers explicit mistake review or the daily plan. Saved answer history still syncs through the existing system. Session position is in memory only, not cross-device or reload restoration. Daily answer targets are distinct from session completion and proficiency.

Scope: this is a guided daily route through existing content, not a newly authored sequenced curriculum, CEFR assessment or mastery system. Other learning tools remain secondary and available. Empty content stays empty; no completion or rewards are invented. No independent Goldfish review claimed.

Verification: owner switching, day/level changes, pause/resume, completed/empty sessions, readiness, same entry point, mobile layout and existing rotation tests. Fixture browser checks do not establish real-account synchronization.

Validation completed: 236 Node tests pass. Existing speech/recency/rotation tests remain green; both browser bundles build. Chromium fixture at 393px starts a nine-exercise mixed round, answers and pauses, resumes the same next question, reaches completion and renders the same daily card in EngoPlay. No page errors or horizontal overflow in the checked flow. The primary action is above the step list on mobile. Production publication is verified separately.
