# Serag OS — Product Simplification v1

## Product decision

Reduce the primary navigation to four destinations:

1. **Today** — a compact daily overview with today's priorities and upcoming items.
2. **Plan** — the single home for tasks, calendar events, reminders, due dates, and unscheduled tasks.
3. **Projects** — one project workspace for both Work and Creative projects, with lightweight filters instead of separate primary sections.
4. **English** — the existing English learning experience, preserving all learning content and progress.

Settings and account actions move to a secondary account menu. Quick Add remains globally available.

## Information architecture

### Today
- Today's open tasks and overdue items.
- The next upcoming event or deadline.
- A compact look at the next few days.
- Quick actions: Task, Event, Note, File.
- Remove nutrition, water, workout, and fitness analytics from the dashboard.

### Plan
- Agenda is the default view; Month is an alternate view.
- Tasks with due dates appear on the calendar.
- Unscheduled tasks remain visible in a compact inbox/list.
- Reminders and standalone events appear alongside tasks.
- Work and Creative project deadlines remain visible.
- Task creation, completion, editing, priority, and due dates are managed here.
- Project-linked tasks keep their existing parent links and remain visible in their project workspace.
- Avoid creating a second event/task data model. Continue using existing owner-scoped records.

### Projects
- Merge Work and Creative navigation into one destination.
- Use simple filters: All, Work, Creative.
- Keep existing project records and workspace capabilities.
- Keep project-specific tasks, notes/briefs, attachments, and references in the relevant project workspace.
- Remove the separate Work Tasks and Deadlines lists when their functions are available in Plan.
- Keep global creative references accessible from Projects without adding a new primary navigation item.

### English
- Preserve current English modules, saved words, articles, grammar, writing, bookmarks, and learner progress.
- Keep the interface English-first; Arabic remains where it is pedagogically useful for meanings and translations.

## Remove Gym & Food

Remove Gym & Food from navigation, pages, dashboard widgets, settings, quick actions, calendar sources, and routine data fetching.

Important: UI/module removal is not permission to destroy historical records. Do not drop tables or delete existing meals, meal items, water logs, workouts, food catalog entries, or profile nutrition targets in this phase. First stop using those features and stop querying those tables in normal application flows. Any permanent data purge requires a separate explicit approval after a clear inventory and backup plan.

## Data and compatibility constraints

- No Supabase schema changes or migrations in this phase.
- No deletion or rewriting of existing task, reminder, project, English, note, attachment, or learning records.
- Preserve task IDs, project parent links, goal links, owner scoping, and RLS.
- Preserve existing account authentication and private Storage behavior.
- Do not change localStorage keys or Reading Studio persistence.
- Keep the existing vanilla JS architecture and avoid new dependencies.

## Delivery stages

1. Audit and map all existing UI, scripts, data reads/writes, and task/calendar/project dependencies.
2. Implement the simplified navigation and merged user experience on a dedicated branch.
3. Add regression tests for navigation, task/calendar integration, project links, and the absence of Gym & Food queries in normal flows.
4. Validate a preview on desktop and mobile.
5. Only after review, consider removing obsolete code and separately decide whether historical health data should be permanently deleted.
