# English mistake correction bank v1

## Purpose
Add a standalone, searchable, one-sentence-at-a-time English mistake-correction exercise to the existing English Academy and EngoPlay navigation. The bank does not write into the primary quiz arrays or Supabase.

## Data source and reuse
- Source: [Elispeak Common English Mistakes](https://github.com/elispeak/elispeak-common-english-mistakes)
- Source data file: `data/common-english-mistakes.jsonl`
- License: MIT. The copyright and permission notice is retained at `data/review/ELISPEAK-MIT-NOTICE.txt`.
- Imported records: 40
- Fields retained from source: stable source ID, category, CEFR level, learner sentence, corrected sentence, English explanation, English practice prompt, tags.
- Editorial additions: Arabic explanation and Arabic translation of the practice prompt. These Arabic translations are drafts and have not been independently human-reviewed.

## Learner flow
1. Filter by level, error category, progress status, or search text.
2. See the uncorrected sentence and type a correction.
3. Check the attempt or reveal the correction.
4. Review the English rule, concise Arabic explanation, and follow-up speaking/writing prompt.
5. Mark the pattern as understood or needing review. Progress is stored in browser localStorage under a user-scoped key; no server write, paid API, or database migration is introduced.

## Safety and scope
- The dataset remains separate from the primary quiz/question arrays.
- No source repo code is copied; only the MIT-licensed text records and notice are reused.
- The app displays the source attribution and warns that Arabic editorial translations are drafts.
- The bank is a practice aid, not an authoritative grammar exam.
