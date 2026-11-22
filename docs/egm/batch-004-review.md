# Notebook batch-004 publication review

## Scope and provenance

Publish four demonstrative/quantifier lessons, sixteen questions (q49–q64) and a 60–90-word status-email task. The shared English/EngoPlay Foundations payload now has sixteen lesson sessions, 64 questions and four writing tasks. Prior question IDs/content and all three earlier per-owner writing keys are preserved. There is no new service, migration, dependency or API credential.

`data/review/curriculum/batch-004/reviewed.json` is an editorial adaptation, not a verbatim archive of the inline submission. Active source pages are null with an explicit unverified status; original page claims remain in `reported_source_refs`. Original PDF bytes were unavailable, and empty `unreadable_pages` arrays do not prove full-book readability. The fifth listed source (First Masterclass) is not cited by the supplied lessons/questions. Source verification remains separate from editorial language review.

## Editorial corrections

- Qualified demonstrative distance as context-dependent. Number agreement is explicit; q54 establishes distance with files across the room rather than assuming that any top shelf is far away.
- Replaced absolute some/any bans with contextual patterns. Any in offers/requests and some under a negative can be grammatical with different meanings. Kept q50 as identification of the specified *some + uncountable noun* pattern, with an explicit note that the any/serving-coffee alternatives can also be grammatical. Q51 specifies the zero-update meaning and ordinary did-not construction.
- Q55 accepts both some and any, explaining the model offer/request pattern and the availability emphasis of any. Q59 now requests the explicit meaning of no replies at all rather than calling every negative-some sentence ungrammatical. Both didn't/did not forms are accepted.
- Clarified that many can be affirmative, and affirmative much is not universally wrong. Q60 is a controlled replacement with a lot of/lots of, rather than an unconstrained correction task with an arbitrarily incomplete answer set. Other phrasings are acknowledged in feedback.
- Corrected the claim that a few/a little guarantees sufficiency, and the claim that few/little necessarily means almost zero. Context determines sufficiency. Q53's result clause supplies that information; q57 specifies scarcity as the intended focus.
- Added atomic, scrambled tokens for all three order tasks. The supplied arrays were already in answer order; q62 also included a standalone question mark. Tiles contain words only, and the model supplies punctuation. Both occurrences of the are retained where required. Prompts constrain phrase placement without judging all other English orders.
- Retained batch-scoped canonical IDs, recognition labels for MCQs and controlled-application labels for written forms. The fourth writing task is a rubric and owner-scoped browser draft, not an automatic writing-quality score.

## Duplicate comparison

No exact normalized prompt/answer match was found against 1,282 inspected public-bank items plus 48 prior Foundations questions (1,330 total). Four Jaccard candidates at threshold 0.55 share generic ordering instructions; manual comparison found different target sentences and no exact duplicates. Topic overlap is intentional practice, not proof of a new skill. This check excludes private imports and does not establish semantic uniqueness. Evidence and candidate dispositions are in `validation.json`.

## Verification

259 Node tests pass, including aggregate/batch equality, unchanged prior question content, four format counts, accepted alternatives, tile multisets/unsolved order and apostrophe sensitivity. At 393px, the fixture browser completed all 64 questions through the actual four UI formats, including the alternative *any* answer for q55 and curly apostrophe input for q41. It verified shared history, immediate-repeat exclusion, reveal without XP, preservation of all three old writing drafts, a separate fourth draft across reload, and all four drafts empty under a different owner. No overflow/page errors were observed. These are fixture checks, not real-account cross-device verification.
