# Notebook batch-006 publication review

## Scope and provenance

Implement the agreed plan: add four place/movement lessons, sixteen questions q81–q96 and one 60–90-word directions task. Both English and EngoPlay consume the same Foundations payload, now 24 lesson sessions, 96 questions and six writing tasks. Preserve all earlier question IDs/content and the five previous owner-scoped browser draft keys. No API, schema, migration, paid service, dependency or credential change is required.

The reviewed file is an editorial adaptation, not a verbatim archive of the inline submission. Supplied page fields were already null; active source references remain null with explicit unverified status. Empty unreadable-page arrays do not establish readability, full-book access or original authorship. All four named sources are cited in the supplied batch, but their PDFs were not independently inspected.

## Editorial corrections

- Clarified context-dependent at/in/on choices; narrowed city-residence examples to the ordinary in Paris pattern rather than banning every at + city usage. Between is not universally restricted to two participants or an exact midpoint. Through does not require enclosure, and through/along can both describe a tunnel or corridor.
- Q81's MCQ accepted answers are now limited to offered options, while feedback acknowledges in the office as a valid unoffered alternative. Q85 no longer accepts at our room for the required inside-room meaning and belongs to the movement lesson.
- Q82 uses an explicit seating row and commas to establish Sarah's relationships. Q87 specifies a same-level cabinet–printer–bookshelf row and offers between/under/behind, excluding the otherwise plausible next to option. Q88 specifies removal from inside a bag to the desk.
- Q86 permits both at/on for a reception point or its surface, explicitly excluding storage inside the furniture. Q89 accepts through/along for the longitudinal tunnel route, explaining the focus of each rather than falsely marking along wrong.
- Q92 is a controlled rewrite that asks for explicit into entry, not a claim that dynamic in is always ungrammatical. Q93 specifies an uncovered bridge and an ordinary bank-to-bank crossing; through can be valid in other covered-passage contexts.
- Added atomic scrambled tokens to q94–q96. Removed the extra the from q95. Retained both supplied q94 phrase orders. Simplified past-tense examples to present/current situations and instructions; preserved raw IDs and added batch-scoped canonical IDs. MCQs are recognition; typed forms/rewrites and order tasks are controlled application.
- The sixth writing task has a 64-word current-location/instruction model, six-task owner isolation and a rubric rather than automatic writing-quality scoring. Removed unnecessary passive forms and an untaught opposite position from the model.

## Duplicate comparison

No exact normalized prompt/answer matches were found against 1,282 inspected public-bank items plus the 80 prior Foundations questions (1,362 total). Token Jaccard screening at 0.55 produced no candidates. This does not establish semantic uniqueness or compare private imports; the same grammar topics legitimately appear elsewhere. Evidence is in `data/review/curriculum/batch-006/validation.json`.

## Verification and release

259 Node tests pass. Course checks include aggregate/batch equality and stable prior content, four format counts, MCQ answer membership, alternative at/on and through/along sets, valid word-order multisets, and rejection of q95's extra the. The 393px browser fixture completes all 96 questions through the four actual UI formats, using the alternative on for q86, along for q89 and reversed location-phrase order for q94. It checks shared history, immediate-repeat exclusion, reveal without XP, preservation of five existing drafts, sixth-draft persistence after reload and empty drafts for all six tasks under a different owner. Expected fixture onboarding is completed through its UI. No page errors or overflow were observed. These are fixture checks, not real-account cross-device verification.

Build 103 keeps entry points, loader, service worker and preview aligned. Release uses a focused PR after CI/preview checks, followed by production READY/commit verification and a coherent public payload with 96 questions before repeating the browser fixture against published assets.
