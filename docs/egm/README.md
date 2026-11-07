# Elephant-Goldfish for SERAG OS

Source: [Google Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model), Apache-2.0. Pinned revision: `e9e1f06aa4e26e95cd4ed37210a0632202c429e9`.

EGM supports development: explicit project context (Elephant), source-grounded documentation and fresh-context review (Goldfish). It supplies neither audio nor vocabulary, and does not run in the website. No models, paid services or framework dependencies are added to SERAG OS.

## Local setup

Run `node scripts/setup-egm.mjs` from the repository. This downloads the complete pinned reference bundle into ignored `.egm/upstream/`, retaining its LICENSE, personas, standards and skill instructions. It requires Git and network access; it does not execute upstream code, install a native plugin, change global Codex settings or run during deployment. Existing modified/different checkouts are rejected rather than reset. Review updates to the pinned revision explicitly.

Read `.egm/upstream/docs/codex.md`, then the selected `.egm/upstream/skills/<name>/SKILL.md`. Installation instructions for the native CLI/desktop plugin are upstream; a reference checkout alone is not a native plugin installation. Do not claim that unavailable native capabilities were exercised.

## Source map for English changes

| Concern | Read before changing |
|---|---|
| Boot and script order | [index](../../index.html), [bootstrap](../../app-bootstrap.js), [preview](../../workspace-preview.html) |
| Shared content and practice | [shared-practice contract](../english-shared-practice-v1.md), [practice state](../../english-practice-state-v1.js), [word practice](../../word-practice-v21.js), [EngoPlay](../../engoplay-v19.js), [expansion](../../english-expansion-v1.js) |
| Ready audio and public resources | [current services contract](../free-english-services-v1.md), [audio facade](../../english-free-services-v1.js), [speech API](../../api/english-speech.js), [resources API](../../api/english-resources.js), [dictionary API](../../api/dictionary.js) |
| User isolation and verification | [project instructions](../../AGENTS.md), [tests](../../tests), [preview adapter](../../workspace-preview.html) |

Preserve shared question banks, account-scoped history, 24-hour automatic selection cooldown, deliberate review and delayed recall. Never silently recycle exhausted recent material. Unreviewed public examples are not scored questions. Keep ready public recordings separate from authenticated private speech; never expose provider credentials.

## Working procedure

1. Read the affected contract and actual source. Record the intended behavior, relevant files and verification in a small task brief here when the change needs a design decision.
2. Choose only the relevant upstream skill. For a drift report, explicitly supply the document directory and read every document in that selected scope. Keep historical build notes distinct from the current contract. Preserve all approval gates of whichever skill is invoked.
3. For a Goldfish review, follow upstream Codex integration: use native subagents with `fork_turns: "none"`, absolute paths to the target, bundled persona, standards and a bounded source reading list. Wait for completed reviews and report failures. Fresh conversation context does not prove filesystem or instruction isolation. Never simulate independent reviewers in the parent conversation.
4. Verify the changed behavior with appropriate tests and fixture flows. Record remaining limitations and resolve findings before delivery. Existing project PR/deployment rules still apply.

The initial [source-check notes](2026-11-07-source-check.md) are a bounded manual application of EGM's documentation/source comparison principle, not a full upstream drift run or a completed Goldfish review loop.
