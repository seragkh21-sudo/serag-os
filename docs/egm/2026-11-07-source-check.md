# Bounded documentation/source check — 2026-11-07

Baseline: SERAG OS `97dd6a44245e24e63693c2c74bcdfb38d71ff486`. Method: direct source comparison inspired by Google's EGM; no independent Goldfish review was run. Scope is the boot instruction and speech-default statements below, not every document or line in the repository.

## AGENTS.md

- The architecture section named `shell-loader.js` as the entry point, but `index.html` loads `app-bootstrap.js?v=85`; that bootstrap fetches `legacy.html` and executes ordered scripts. Corrected the instruction in this change.

## docs/english-shared-practice-v1.md

- The build 84 speech section says a new user defaults to device speech. Build 85's `english-free-services-v1.js` `preference()` defaults to `ready`; `speak()` tries the public catalog and then device speech for missing recordings. The build 84 note describes the earlier implementation. Added an explicit pointer to the current build 85 contract to prevent treating that historical default as current.

## Remaining scope

This check does not establish real-account synchronization, measured phone audio latency, third-party service availability or complete documentation coverage. Those require their own scoped verification. Native plugin installation and fresh-context review are not claimed.
