# Voice library

Open **English → Voice library**, **Speaking & video → Open voice library**, or **EngoPlay → Review and reinforce → Voice library**.

Record a microphone attempt or upload audio, optionally add a practice text, listen to the model voice, replay the recording at different speeds, and save the transcript and personal pronunciation notes. **Record again** starts a separate attempt with the same practice text. Archive is reversible; no permanent deletion is exposed.

Audio is uploaded to the existing private `serag-attachments` bucket under `<owner>/voice/<recording-id>/audio.<extension>`. Metadata lives in `public.english_voice_recordings`; owner-only RLS and column-level update grants protect it. Existing Storage owner-folder policies are unchanged. Playback uses a 15-minute signed URL. Only audio needed for the open recording is loaded. Files are limited to 50 MiB; microphone sessions stop after 10 minutes. New audio remains a browser draft until Save; leaving warns about unsaved work. Failed saves retain the draft for retry and local download. Account changes stop recording, discard account-bound drafts and clear rows/audio.

The schema in `db/english-voice-library-v1.sql` was applied to project `kdfbxcdxdhofqidczbot` as `english_voice_library_v1`. Metadata updates compare the last read revision; a trigger increments it. Audio metadata cannot be updated by the client. Concurrent edits fail with a recovery message rather than overwriting another device. An interrupted insert can be retried without silently overwriting an already-saved attempt.

## Transcription boundary

Live transcription is an optional, unchecked browser SpeechRecognition feature for English (US/UK). The UI explains that the browser may send audio to its speech-service provider and may require internet. Unsupported or denied speech recognition does not prevent recording or manual transcripts. Recognition can stop earlier than the recorder; the UI reports that and preserves the transcript captured so far. Transcripts are editable and are **not pronunciation scores**. Uploaded audio files are not transcribed automatically. No paid AI service or new framework is introduced.

## Verification

Node tests exercise upload/metadata failure recovery, private paths, signed playback, recording and transcript events, microphone denial, late permission after close, account switching during upload, revision conflicts, repeated takes, reversible archive, format limits and escaping. These use mocked browser and Storage APIs; they do not record a user's microphone.

Database verification used synthetic account/recording IDs inside a rolled-back transaction: owner access, cross-account read and insert isolation, revision increment and stale revision rejection passed. The security advisor reported no finding for the new table or trigger; existing widget/auth findings remain outside this change.

Browser checks and release state are recorded in the pull request. Real microphone capture, browser-provider transcription accuracy and real-account audio uploads require user testing on the target device.
