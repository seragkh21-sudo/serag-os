# One learning journey

Engoplay no longer exposes a separate Cards tab. Daily and unit buttons start the shared sentence engine with four vocabulary targets and up to three existing questions from that unit. Each word first appears as a meaning-cued choice, followed by feedback with the word and full natural sentence. Its typed recall comes later, separated by at least three other questions (six when three grammar fillers are available). Words uses the same engine.

Recognition and typed retrieval have different activity keys. Recognition alone does not increment independent typed-retrieval progress. Hint/retry/reveal feedback stays distinct. A recalled word schedules its next review in the existing owner-scoped Engoplay word-review queue: one day initially, longer intervals for later independent recalls, and one day for assistance/incorrect recall. Same-day review updates are guarded to avoid interval inflation from replay. Previously saved reviews remain intact. Fresh/due words come before future scheduled reviews.

Number keys select choices; Enter submits typed answers or advances feedback. These shortcuts are active only while the exercise is visible. No paid services or schema changes are required. The requested hero text is used verbatim.

Validation: 28 targeted and existing regression tests passed; checks cover all 202 published vocabulary items, unique choices, minimum spacing, retry/reveal/assistance, owner isolation and routing daily/unit practice through the shared engine. Vercel preview reached READY and served the new hero, shared routing and no Cards control. Browser interaction verification was blocked by a browser connection failure; no fresh visual verification is claimed for this change.
