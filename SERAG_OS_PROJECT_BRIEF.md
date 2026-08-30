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
- Keep the Home dashboard intentionally compact; detailed views live in their own sections.

## 3) Main sections

### Home / Dashboard
- Daily summary.
- Water, calories and open-task stats.
- Upcoming tasks.
- **Weekly Progress:** one switchable 7-day chart for water, calories, completed tasks, and workouts.
- **Mini Calendar:** the next 7 days plus the nearest upcoming items.
- Latest notes / attachments.
- Quick AI assistant input remains part of the product direction.

### Gym & Food
- Meals and calories.
- Protein / carbs / fat.
- Workouts and exercises.
- Daily / weekly / monthly progress.
- Water tracking with quick cup logging.

### Work
- Projects.
- Project progress.
- Tasks / checklist per project.
- Deadlines and status.

### English
The English area is a focused learning workspace rather than a collection of basic forms.

#### Writing Studio
- Write and save full English articles.
- Live word count while writing.
- `My Articles` library with search, preview, word count, estimated reading time and date.
- Every saved article can be opened in a dedicated reading view.
- Open articles can be read aloud with browser English speech, copied, edited, saved again, or deleted.

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

#### English overview
- Compact KPI row for vocabulary count, mastered words, saved writing, grammar topics, and course progress.
- Keep the section visually calm and avoid turning it into a dense analytics dashboard.

### Creative
- Creative projects and progress.
- Smart creative assistant area.
- Courses to watch.
- Reference / source websites and materials.
- Expandable resource system.

### Calendar
- Month view with day selection.
- Unified events sourced from Tasks, Reminders, Work deadlines, Creative deadlines, and Workouts.
- Standalone calendar events are stored as Reminders and sync through Supabase across devices.
- Quick add event form.
- One-click export of an event to Google Calendar and direct Google Calendar launch.
- **Full automatic two-way Google Calendar sync is planned but requires Google OAuth client credentials and secure token storage before activation.**

### Tasks
- Central task list.
- Categories / due dates / status.

### Notifications / Reminders
- Timely reminders for tasks, workouts, English, water, and routines.

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
- `index.html` + `app.js` + `styles.css` — existing application.
- `shell-loader.js` + `dashboard-v2.js` + `dashboard-v2.css` — progressive dashboard/calendar enhancement layer.
- `english-v3.js` + `english-v3.css` — professional English workspace enhancement layer.
- `api/pronunciation.js` — normalized pronunciation/phonetics lookup endpoint used by Vocabulary.
- Supabase — PostgreSQL database + Authentication + Storage.
- Vercel — production hosting and GitHub deployments.
- Vercel AI SDK / API route — AI assistant implementation where configured.

Longer-term migration to Next.js remains possible, but should not be done merely for framework consistency while the current app is stable.

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

`english_words` now also stores:
- `status` — learning/mastered state.
- `phonetic` — compact phonetic transcription when found.
- `audio_url` — pronunciation audio URL when found.
- `part_of_speech` — dictionary part of speech when found.

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
### 2026-08-30 — English Workspace v3
- Reworked English into a professional learning workspace while keeping the UI calm.
- Replaced the Writing preview-only experience with `My Articles` and a full article reader.
- Added article search, word count, reading-time estimate, read-aloud, copy, edit and delete.
- Added automatic vocabulary phonetics and pronunciation lookup.
- Added dictionary audio with browser speech fallback.
- Added persistent `phonetic`, `audio_url`, and `part_of_speech` fields to `english_words`.
- Added Learning/Mastered vocabulary states, filtering and Quick Review mode.
- Added compact English KPI summary and improved course progress presentation.

### 2026-08-30 — Calendar + Weekly Progress
- Added one calm, switchable 7-day chart to Home: Water / Calories / Tasks / Workouts.
- Added a compact upcoming-week calendar card to Home.
- Added a full Calendar section with a month grid and selected-day event list.
- Calendar now combines Tasks, Reminders, Work deadlines, Creative deadlines, and Workouts.
- Added standalone calendar-event creation using the existing `reminders` table.
- Added one-click Google Calendar export and direct Google Calendar launch.
- Kept full automatic Google Calendar sync pending secure OAuth credentials.
- Recorded GitHub, Vercel, and Supabase project identifiers.
- Confirmed the current production app is static rather than Next.js; Next.js remains a future option rather than an immediate migration requirement.

### 2026-08-30 — Project consolidation
- Consolidated prior website discussions into one dedicated project.
- Set clean/static/not-crowded visual direction.
- Added water tracking to Gym & Food.
- Expanded English into Writing, Vocabulary, Grammar, and Course.
- Expanded Creative with courses, reference websites, material sources, and a flexible assistant area.
- Confirmed cross-device persistent sync as a core requirement.
