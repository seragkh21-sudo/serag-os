# Open English-learning resources for Serag OS / EngoPlay

## Included in the app

`english-open-sentences-v1.js` adds a small, original English–Arabic sentence-choice bank for B1/B2. Examples are newly authored for practice; they are not copied from Duolingo or a commercial textbook. The patch is additive and idempotent, and keeps the current shared grammar/question arrays intact.

## External source candidate: Tatoeba via ManyThings

- ManyThings bilingual sentence-pair index: https://www.manythings.org/anki/
- English–Arabic export listed there: `ara-eng.zip` (12,574 pairs on the page updated 2026-02-13).
- Tatoeba downloads and license notes: https://tatoeba.org/en/downloads
- Tatoeba attribution FAQ: https://en.wiki.tatoeba.org/articles/show/faq

Tatoeba text is generally released under CC BY 2.0 FR; attribution is required. The corpus is community-contributed and can contain awkward or incorrect examples, so imported records must be reviewed before becoming active learning questions. Audio is not covered by the same blanket license: do not import audio unless its individual license and attribution are verified.

## Import workflow

Run the importer from the repository root on a machine with internet access:

```bash
python scripts/import_tatoeba_ar_en.py --limit 500 --output data/review/tatoeba-ar-en-review.jsonl
```

The script downloads the published ManyThings ZIP, preserves its attribution field when present, normalizes whitespace, filters empty/duplicate pairs, and writes a review file. It deliberately does **not** write into production JavaScript or Supabase: a reviewer must check quality, level, and licensing before a batch is promoted into the live bank.

## Why not copy Duolingo?

Duolingo's proprietary course files and internal endpoints are not treated as open data here. Use public datasets and original exercises instead.
