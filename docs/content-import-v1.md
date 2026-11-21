# Private content import — build 97

English → Import questions or articles opens the same importer available in EngoPlay. Flow: choose a file, extract locally, compare to the current academy bank and all owner-scoped reading articles, edit/recheck, then explicitly add the selected records. Questions enter the shared academy/EngoPlay bank; articles enter the existing Reading Studio table. Original files are not uploaded or retained by this feature. No model API, Adobe API credential or paid service is introduced.

## Formats and limits

- Text-based PDF: at most 20 MB and 100 pages. PDF.js 6.5.438 reads text in a same-origin worker with evaluation/XFA disabled. Sparse-text pages are reported; image-only PDFs require OCR before import. Acrobat in ChatGPT can help prepare a searchable PDF/text, but its installed chat tools are not a runtime website API.
- TXT/MD: at most 2 MB. Article mode stores one article. Question mode supports numbered prompts, A)–D) choices, `Answer:` and optional `Explanation:` lines. Wrapped choices are joined; ambiguous repeated option letters are rejected. Extraction is not a guarantee that every layout/question in a PDF was recognized.
- JSON: question/article objects, arrays, or containers named `questions`, `articles`, `items`, `data`, `records`.
- CSV: question columns `prompt,A,B,C,D,answer,explanation,level,topic`, or article columns `title,content,level,topic`. A JSON-encoded `options` array is also supported.
- JS/JSX/TSX: literal objects are parsed using Babel 8.1.3; imports, functions, getters, expressions and JSX are never executed. Only static question/article data is read. This is not a renderer or a converter for arbitrary React applications.
- Maximum 500 candidate records, 2–4 unique choices, prompt 2,000 chars, choice 500 chars, explanation 3,000 chars, article 20–200,000 chars. Supported practice preferences B1–C2 are instructional groupings. Missing levels use the selected default; no level assessment or automatic answer generation occurs.
- Images, DOCX, scanned-page OCR inside the site, embeddings and generated questions are outside this version. Unsupported files receive an explicit message.

## Comparison and review

Normalization uses NFKC, lowercase, normalized blank placeholders and Unicode letters/numbers. Exact question identity is normalized prompt plus answer, independent of source ID, topic and option order; article identity is normalized full content regardless of title. The same prompt with another answer is a blocked conflict. Invalid/missing answer keys stay blocked until corrected.

New rows default to selected; exact duplicates cannot be selected. Similarity uses a Jaccard threshold of .82 on up to 120 initial text tokens, with at least four tokens. This only spots similar wording and is not semantic deduplication or a confidence estimate. Similar rows require an explicit selection. Duplicates within the same file are included in comparison. Review pages show 20 records at a time; edits are rechecked and require another Add click after changing fields. Existing content is reloaded before saving, and changed classifications return to preview instead of silently committing.

## Persistence and isolation

`english_imported_questions` has owner RLS, no anonymous grants, server-generated fingerprints and unique owner/prompt and owner/fingerprint keys. Reading Studio gains nullable import-source/batch metadata and an import fingerprint index. The server's normalized SHA-256 matches the browser's Unicode normalization for the checked bilingual fixture.

`commit_english_import` and `undo_english_import` are authenticated SECURITY INVOKER RPCs with empty search paths and explicit expected-owner checks. Questions/articles in one commit are transactional. Repeated commits do not duplicate imported rows; static bundled content is checked by the browser. Concurrent manual article creation outside this importer cannot guarantee deduplication against an imported article, because ordinary articles do not have import fingerprint uniqueness.

Each saved row retains source filename, batch and source page when available. Batch undo removes only that owner's imported questions/articles, including reading notes on those articles; answer/XP history and other content remain. It requires a deliberate UI confirmation. If a network response is lost after commit, refreshing/retrying is safe against imported-row duplicates. A failed initial page read keeps the bank unready; refresh failure preserves known same-account content but blocks a fresh import comparison. Account changes clear private files, previews and cached banks, including pending async results. Selected records sync through Supabase; unsaved previews live only in the current tab.

The CLI created the migration file; its filename was aligned with the actual server-applied migration version `20261121133445` to keep future history consistent. No production secrets were read. Owner RLS read/insert/delete, expected-owner rejection, duplicate retries and undo were verified in a transaction that was rolled back. Anonymous SELECT/EXECUTE privileges were denied. Security advisors returned no notices related to the import schema.

## Verification boundaries

Unit checks cover missingness, valid choices/levels, aliases, conflicts, same-file duplicates, similar wording, safe JS parsing and bounds. Loading checks cover paginated history, incomplete reads and account races. Chromium fixture uses actual bundled UI/parser/PDF worker plus the existing mock Supabase adapter, covering preview/edit/save, shared questions, reading articles, duplicate retry, reload, account switch and undo at 393px. Text PDF extraction and image-only/empty PDF rejection are exercised. These fixture checks do not claim a file upload from the owner's real signed-in account.

Completed local validation: 255 Node tests, production importer/monitoring/natural-audio builds, and the full 393px Chromium fixture import flow passed. Batch-level practice and direct Reading Studio access are included. No horizontal overflow or page errors in the checked flow. Production deployment/served assets are checked separately before reporting publication.
