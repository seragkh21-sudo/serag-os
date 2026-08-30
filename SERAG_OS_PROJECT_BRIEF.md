# Serag OS — Website Project

> **Purpose:** Single source of truth for the Serag OS / Personal Life OS website. Future additions, fixes, deployment work, and product decisions should stay consistent with this document.

## 1) Product vision
A personal dashboard that organizes daily life in one place, with persistent cross-device data and an AI assistant that can turn natural requests into actions.

Core loop: **Plan → track → analyze → remind → improve.**

## 2) UX / visual direction
- Clean, static, calm, easy to scan.
- Avoid dense neon / night-dashboard styling.
- Strong whitespace and clear hierarchy.
- Desktop and mobile responsive.
- Prefer one useful visualization over many decorative charts.
- Reduce clicks and surface the next useful action instead of adding decorative widgets.
- Keep the Home dashboard intentionally compact; detailed views live in their own sections.

## 3) Main sections

### Home / Today Command Center
- The top of Home is a **Today Command Center** designed to explain the day in a few seconds.
- Shows calories consumed vs target plus remaining calories.
- Shows protein consumed vs target plus remaining protein.
- Shows water consumed vs target plus remaining cups.
- Shows open-task count.
- Shows the nearest upcoming item across Tasks, Reminders, Work deadlines, Creative deadlines and Workouts as **Next Up**.
- **Weekly Progress:** one switchable 7-day chart for water, calories, completed tasks, and workouts.
- **Mini Calendar:** the next 7 days plus the nearest upcoming items.
- Latest notes / attachments remain available without turning Home into a dense dashboard.

### Quick Add
The global `+` drawer is a fast-action surface rather than only a capture drawer.
- Meal → jumps directly to food search.
- Water → one-click 250 ml log.
- Task → compact quick task form.
- Workout → compact workout form.
- English Word → quick vocabulary add with pronunciation enrichment.
- Note → opens the existing quick-note capture.
- Existing file/image/audio recording capture remains available.

### Gym & Food
- Dedicated **Daily Nutrition** card with Calories / Protein / Carbs / Fat.
- Shows remaining calories and protein from profile goals.
- Today's meals are visible/open by default.
- Recent meals provide **Eat again** one-click repeat logging.
- Food-catalog search and manual entry remain available.
- Workouts and water tracking remain in the same section.

### Work
- Work projects are no longer list-only records.
- Every project has an **Open workspace** view with:
  - Client / type / deadline.
  - Status.
  - Project-specific Tasks.
  - Progress derived automatically from completed project Tasks.
  - Notes.
  - Private file attachments and external links.
- Project Tasks still remain part of the central Tasks system.

### English
The English area is a focused learning workspace rather than a collection of basic forms.

#### Writing Studio
- Write and save full English articles.
- Live word count while writing.
- `My Articles` library with search, preview, word count, estimated reading time and date.
- Every saved article opens in a dedicated reading view.
- Open articles can be copied, edited, saved again, or deleted.
- Browser English read-aloud remains the fallback listening option.
- Each article can optionally have a private custom audio file uploaded by the user.
- Custom article audio takes priority over browser TTS when present.
- Supported uploads use the existing private `serag-attachments` Supabase Storage bucket and allow audio files up to 50MB.
- Custom audio supports native playback controls plus 0.75x / 1x / 1.25x / 1.5x playback speeds.
- Replace and remove audio actions are available from the article reader.
- Playback position and preferred playback speed are persisted in Supabase so listening can resume across devices.
- Deleting an article with custom audio also removes the associated Storage object.
- **Clickable article words:** clicking a word opens a compact lookup showing phonetic pronunciation, definition / saved meaning, part of speech and audio when available.
- A word can be added directly to Vocabulary from the article lookup.

#### Vocabulary
- Add a word, Arabic meaning and example sentence.
- Automatic pronunciation lookup after adding a word.
- Show compact IPA/phonetic transcription beside the word when available.
- Use dictionary audio when available, with browser English speech as fallback.
- Store pronunciation metadata in Supabase so it persists across devices.
- Show part of speech when the dictionary provides it.
- Search and filter vocabulary by `Learning` / `Mastered`.
- Edit and delete words.

#### Quick Review
- Review non-mastered words one at a time.
- Reveal meaning on demand.
- Play pronunciation while reviewing.
- Mark a word `Mastered` or move to the next word.
- A mastered word can be returned to `Learning` / review later.

#### Grammar
- Save grammar topics and notes.
- Edit/delete saved grammar notes.

#### Course
- Save English courses / units and links.
- Track progress percentage with a visible progress bar.
- English overview shows average course progress.

### Creative
- Creative project cards open a dedicated **Creative Workspace**.
- Workspace includes:
  - Project type / deadline / status.
  - Brief.
  - Project-specific Tasks with derived Progress.
  - Attachments.
  - Project-specific References.
- Global References & Sources remains available with Search and type filters such as Motion / Composition / Typography / AI / Fonts / Material.
- Creative courses remain available.

### Calendar
- **Agenda View** is the default fast daily view for the next 14 days.
- **Month View** remains available through a simple Agenda / Month toggle.
- Unified events continue to combine Tasks, Reminders, Work deadlines, Creative deadlines, and Workouts.
- Standalone calendar events are stored as Reminders and sync through Supabase across devices.
- One-click export of an event to Google Calendar and direct Google Calendar launch remain available.
- **Full automatic two-way Google Calendar sync is planned but still requires Google OAuth client credentials and secure token storage before activation.**

### Tasks
- Central task list remains the source for general Tasks.
- Tasks can now optionally belong to a specific Work or Creative project using `parent_type` + `parent_id`.
- Project Tasks appear inside their project Workspace while remaining normal Tasks in the shared data model.

### Settings
- New Settings page for user-editable goals.
- Edit display name.
- Edit daily calorie target.
- Edit daily protein target.
- Edit daily water target in cups.
- Home and Gym & Food read these targets automatically.

### Mobile Navigation
On mobile, the old horizontally scrolling top navigation is replaced visually with a fixed bottom navigation:
- Home
- Health
- Tasks
- Calendar
- More

`More` contains English, Work, Creative and Settings. Desktop keeps the sidebar navigation.

### Notifications / Reminders
- Timely reminders for tasks, workouts, English, water, and routines remain part of product direction.

### AI Assistant
Should understand requests such as:
- Add a meal and estimate calories/macros.
- Add a workout and reminder.
- Add an English homework deadline.
- Add tasks/events.
- Analyze progress and offer suggestions.
- Help evaluate creative work.
- Create daily plans.

## 4) Sync and persistence requirement
Hard requirement:
- Data persists after closing or reopening the site.
- The same account sees the same data on mobile, desktop, or another device.
- Browser local storage is not the primary source of user data.
- User data is stored in Supabase and protected per authenticated user.

## 5) Current technical implementation
Current production implementation is a lightweight static web app rather than Next.js:
- `index.html` + `app.js` + `styles.css` — stable base application.
- `shell-loader.js` — production composition loader.
- `dashboard-v2.js` + `dashboard-v2.css` — calendar / weekly analytics domain module.
- `english-v3.js` + `english-v3.css` — professional English workspace module.
- `english-audio-v4.js` + `english-audio-v4.css` — custom article-audio module.
- `microsoft-tts-v1.js` — English speech enhancement / fallback layer where supported.
- **`serag-v5.js` + `serag-v5.css` — unified cross-product UX module** for Today Command Center, Nutrition, Quick Add, Mobile Navigation, Work/Creative Workspaces, Agenda, Settings and article word lookup.
- `nutrition-v2.js` / `nutrition-v2.css` are retained only for backward compatibility with stale cached loaders and are no longer loaded by current Production.
- `api/pronunciation.js` — normalized pronunciation/phonetics lookup endpoint used by Vocabulary and article word lookup.
- Supabase — PostgreSQL database + Authentication + private Storage.
- Vercel — production hosting and GitHub deployments.

The v5 consolidation intentionally groups new cross-section behavior into one product-level module rather than creating a separate enhancement file per feature. A future full base-app refactor remains possible, but should only happen when it meaningfully reduces risk rather than for framework consistency.

## 6) Connected project references
- GitHub repository: `seragkh21-sudo/serag-os`
- GitHub default branch: `main`
- Vercel project: `serag-os`
- Vercel project ID: `prj_YTgtU6anxRHq2GtShTkVusi61neo`
- Production domain: `https://serag-os.vercel.app`
- Supabase project ref: `kdfbxcdxdhofqidczbot`
- Supabase region: `eu-west-2`

## 7) Current data model
Each user-owned record is scoped by the authenticated user through Supabase/RLS.

Existing relevant tables include:
- `profiles`
- `tasks`
- `reminders`
- `workouts`
- `meals`
- `meal_items`
- `water_logs`
- `work_projects`
- `creative_projects`
- `creative_resources`
- `courses`
- `english_words`
- `english_writing`
- `grammar_topics`
- `quick_notes`
- `attachments`
- `assistant_messages`
- `food_catalog`

Nutrition tracking uses:
- `meals.calories`
- `meals.protein_g`
- `meals.carbs_g`
- `meals.fat_g`
- `profiles.calorie_target`
- `profiles.protein_target`
- `profiles.water_target`

Project Task linking uses new optional Task fields:
- `tasks.parent_type` — e.g. `work_project` / `creative_project`.
- `tasks.parent_id` — UUID of the owning project.

Creative References can now belong to a project using:
- `creative_resources.project_id`.

Project attachments reuse the existing `attachments.parent_type` / `attachments.parent_id` model and the private `serag-attachments` Storage bucket.

`english_words` also stores:
- `status` — learning/mastered state.
- `phonetic` — compact phonetic transcription when found.
- `audio_url` — pronunciation audio URL when found.
- `part_of_speech` — dictionary part of speech when found.

`english_writing` also stores custom listening metadata:
- `audio_storage_path` — private Supabase Storage path for the article audio.
- `audio_name` — uploaded file name.
- `audio_mime_type` — stored audio MIME type.
- `audio_position_seconds` — last listening position for resume.
- `audio_playback_rate` — preferred listening speed.

Audio-progress-only updates preserve the article's editorial `updated_at` date so normal listening does not make the article look newly edited.

The Calendar intentionally reuses the existing tables instead of introducing duplicate event records.

## 8) Product rule
Any website work belongs to **Serag OS Website**, including:
- Features and UI changes.
- Database changes.
- Bugs / fixes.
- Mobile responsiveness.
- AI assistant behavior.
- Supabase changes.
- Vercel deployment changes.
- GitHub/code changes.

When a decision changes, update this file.

## 9) Change log
### 2026-08-30 — Serag OS v5 UX Upgrade
- Added Today Command Center with calories, protein, water, open Tasks, remaining goals and Next Up.
- Reworked Quick Add around Meal / Water / Task / Workout / Word / Note actions.
- Added fixed mobile Bottom Navigation with a More menu.
- Added Daily Nutrition card with Calories / Protein / Carbs / Fat, remaining goals and Recent Meals / Eat Again.
- Added Work Project Workspace with status, deadline, Tasks, derived progress, Notes and Attachments.
- Added Creative Project Workspace with Tasks, derived progress, Brief, Attachments and project-specific References.
- Added Search + type filters to Creative References.
- Added Calendar Agenda / Month toggle with Agenda as the fast daily view.
- Added clickable word lookup inside English article reading view with pronunciation and Add to Vocabulary.
- Added Settings page for display name, calorie target, protein target and water target.
- Added `tasks.parent_type`, `tasks.parent_id`, and `creative_resources.project_id` to support real project relationships.
- Consolidated the new shared UX into `serag-v5.js` + `serag-v5.css` and stopped loading the standalone nutrition-v2 layer in current Production.

### 2026-08-30 — Daily Protein Tracking
- Added protein as a first-class daily metric beside calories and water.
- Protein totals are calculated from the day's logged meals and profile target.
- Functionality is now incorporated into Serag OS v5.

### 2026-08-30 — Custom Article Audio
- Added optional user-uploaded audio to English Writing articles.
- Added private Supabase Storage persistence using the existing user-scoped attachment bucket.
- Added a custom article player with 0.75x / 1x / 1.25x / 1.5x speeds.
- Added playback-position and playback-speed resume across devices.
- Added Replace / Remove audio controls.
- Custom audio takes priority over browser TTS, with automatic TTS fallback when no upload exists.
- Article deletion cleans up its linked custom-audio Storage object.

### 2026-08-30 — English Workspace v3
- Reworked English into a professional learning workspace while keeping the UI calm.
- Replaced the Writing preview-only experience with `My Articles` and a full article reader.
- Added article search, word count, reading-time estimate, read-aloud, copy, edit and delete.
- Added automatic vocabulary phonetics and pronunciation lookup.
- Added dictionary audio with browser speech fallback.
- Added Learning/Mastered vocabulary states, filtering and Quick Review mode.

### 2026-08-30 — Calendar + Weekly Progress
- Added one calm, switchable 7-day chart to Home: Water / Calories / Tasks / Workouts.
- Added a compact upcoming-week calendar card to Home.
- Added a full Calendar section with a month grid and selected-day event list.
- Calendar combines Tasks, Reminders, Work deadlines, Creative deadlines, and Workouts.
- Added standalone calendar-event creation using the existing `reminders` table.
- Added one-click Google Calendar export and direct Google Calendar launch.
- Kept full automatic Google Calendar sync pending secure OAuth credentials.

### 2026-08-30 — Project consolidation
- Consolidated prior website discussions into one dedicated project.
- Set clean/static/not-crowded visual direction.
- Confirmed cross-device persistent sync as a core requirement.
