# Natural English speech

All English synthesis entry points delegate to `seragMicrosoftTTS`, now backed by an optional local Kokoro worker. Existing dictionary audio, uploaded recordings and video soundtracks retain their original recordings. The first synthesis request opens a voice choice with a model-download notice. Natural mode uses US Heart or UK Emma; device mode uses the existing browser fallback. No Azure API or paid provider is enabled.

The browser downloads Kokoro q8 model weights (approximately 90 MB) from Hugging Face, plus bundled runtime assets from this site. Model cache is managed by Transformers.js/browser Cache Storage. Text is processed in the worker and is not sent to Hugging Face. Audio blobs remain in memory, are revoked on stop/end, and are not added to the service worker or database. No microphone input is sent to this model. Existing optional live transcription is separate.

Long passages are divided into <=220-character word-preserving chunks to avoid the model token limit. Requests are serialized off the UI thread; stop/new request tokens prevent stale playback. Navigation and auth changes stop playback. Natural voice requires WASM, a supported browser, adequate memory and an initial network connection. First preparation and CPU inference can be slow, particularly on phones. Errors stay visible and users can explicitly select device voice. No claim of identical quality or speed on every device is made.

Build: `node scripts/build-natural-audio.mjs` creates ignored `assets/natural-voice` bundles and copies runtime/license files. Vercel runs the same command and serves the existing static root. JS dependencies are lockfile pinned. CSP adds WASM execution, same-origin workers and Hugging Face model download hosts; no generic JavaScript eval or arbitrary external scripts are allowed.

Sources: https://github.com/hexgrad/kokoro/tree/main/kokoro.js and https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX . Kokoro and model weights are Apache-2.0. Dependency notices are retained in the worker bundle and separate copied license files.
