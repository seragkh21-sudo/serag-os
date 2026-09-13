# Serag OS

Personal productivity web app for tasks, fitness, nutrition, English learning, creative projects, references, and synced data via Supabase.

## Creative Workspace Sessions

The Creative section includes project-linked or standalone boards with image/video uploads, notes, prompts, links, connectors, pan/zoom, resizing, undo/redo, a reusable session file tray, and archive/restore. Moodboard and storyboard templates are available when creating a session.

`creative-workspace.js` and `creative-workspace.css` extend the existing vanilla JavaScript app through `shell-loader.js`. No new browser dependencies or paid services are required. The database schema in `db/creative-sessions.sql` was applied as `creative_workspace_sessions` to the existing Supabase project. Files use the existing private `serag-attachments` bucket and its owner-folder policies, with a 50 MiB per-file limit and signed playback URLs. Video playback depends on the browser's codec support; the original file is available when preview fails.

Board documents autosave using a revision comparison. Conflicting edits require saving a separate session instead of overwriting the remote version. Pending metadata drafts are stored per account and session in localStorage for recovery; media bytes are uploaded to Storage, not localStorage. Closing waits for uploads and saves. Removing a media node retains the source file in the session's Files tab; archiving retains the entire session. Undo/redo history is limited to the current board visit.

Validation: browser interaction checks with a mocked Supabase client cover create/upload/playback/drag/resize/connect/undo/reopen/failure/conflict/archive flows and a 393px mobile viewport. The existing app boot and login screen were also checked. Real database checks verified owner access, denial of cross-account read/write/delete and owner reassignment, and stale revision handling inside a rolled-back transaction. No test content was left in the production database. Uploads from a real signed-in account have not been exercised by the automated browser tests.
