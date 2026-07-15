# Docket Obsidian Plugin

Welcome to the Docket plugin repository! This document serves as a guide for any agent (or human) working on this codebase to understand its design philosophy, architecture, and established patterns.

## Objective

Docket is a cognitive task management dashboard that separates immediate execution from long-term strategy. It heavily utilizes semantic tagging, focus modes, and frictionless capture to provide an optimal task management experience within Obsidian.

## Design Philosophy

- **Zero Build Complexity:** We avoid React, Svelte, or Vue. The entire UI is built using vanilla TypeScript DOM APIs. This keeps the bundle extremely small and adheres closely to Obsidian's idiomatic plugin development practices.
- **Native Capabilities:** We prefer native HTML5 features (like the Drag and Drop API) over external libraries (like SortableJS) to reduce overhead.
- **Native Theming:** We strictly use Obsidian's CSS variables (e.g., `var(--background-primary)`) to ensure flawless out-of-the-box support for both Light and Dark modes.
- **No Background Sync:** Data persistence is handled via Obsidian's standard `this.loadData()` and `this.saveData()` API writing to `data.json`.

## Core Architecture

### File Structure

- `manifest.json` / `package.json` / `esbuild.config.mjs` / `tsconfig.json`: Standard Obsidian plugin build infrastructure.
- `src/main.ts`: The entry point. Handles plugin lifecycle (`onload`, `onunload`), registers the view, adds ribbon icons, commands, and settings tab, and manages `loadData`/`saveData`. Includes data migration logic for legacy column ordering and automatic DeepWork tag creation.
- `src/types.ts`: Centralizes all data interfaces (`Task`, `Bucket`, `Tag`, `DocketSettings`) and provides defaults and utility functions. Includes `bucketUpdatedAt`, `reminderAt` timestamps, and `showCounter` field for buckets.
- `src/settings.ts`: Implements `PluginSettingTab` for full CRUD operations on Sections (formerly Buckets), Tags, and Deep Work configuration. Terminology uses "Sections" in the UI.
- `src/DocketView.ts`: The main `ItemView`. It acts as a router, rendering the top navigation bar, quick capture bar with tag filter pills, and managing transitions between the three main tabs (Dashboard, Daily Dump, Archive).
- `src/DashboardTab.ts`: The core responsive grid dashboard. Handles section drag-and-drop reordering, task drag-and-drop with drop indicators, inline capture with tag suggestions and keyboard navigation, context menus, reminders, search filtering, and waiting time counters.
- `src/DailyDumpTab.ts`: A divergent staging area with a date picker, debounced auto-saving scratchpad with markdown preview, and optional sync to Obsidian daily notes (Daily Notes or Periodic Notes plugins).
- `src/ArchiveTab.ts`: A historical ledger of completed tasks, grouped by month, featuring live search filter and restore functionality to move tasks back to active buckets.
- `styles.css`: All CSS rules. Highly responsive, fully utilizing Obsidian CSS variables.

### Data Model (`types.ts`)

State is primarily managed through arrays of objects:

- `Task`: Has an `id`, `text`, `bucketId`, `tags` (array of tag IDs), boolean `isCompleted`, timestamps (`createdAt`, `completedAt`, `bucketUpdatedAt`, `reminderAt`), and an `order` integer for sorting.
- `Bucket`: Defines sections in the dashboard with `id`, `name`, `icon`, `color`, `order`, and `showCounter` (boolean for waiting time display). Legacy `column` field is deprecated but kept for migration.
- `Tag`: Defines custom semantic tags with a `name` and `color`.
- `DocketSettings`: The root state object combining the above, plus `deepWorkTagId`, `dailyDumps` (record of date string to markdown text), and `version` for schema migrations.

### DOM Management

Because we don't use a declarative framework, DOM updates are largely imperative:

- Components often have a `.render()` method that clears their container (`.empty()`) and rebuilds the DOM tree.
- When data changes (e.g., a task is dropped, a checkbox clicked), we update the state object, call `plugin.saveSettings()`, and the relevant views are informed to re-render or selectively update.
- `DocketView.ts` coordinates re-renders across the active tab.

## Future Development Guidelines

1.  **Maintain Native Feel:** When adding UI components, ensure they use standard Obsidian classes where applicable (e.g., `.mod-warning`, `.mod-cta`) or follow the established `docket-*` prefix convention in `styles.css`.
2.  **State Mutations:** Always call `plugin.saveSettings()` after modifying `plugin.settings`.
3.  **Cross-tab synchronization:** The architecture assumes data can change. If a task is archived from the Dashboard, the Archive tab needs to reflect this when opened. Our pattern of `.render()` on tab switch handles this gracefully.
4.  **Drag and Drop:** Modifying drag and drop requires careful attention to the native HTML5 API events (`dragstart`, `dragover`, `dragleave`, `drop`) handled in `DashboardTab.ts`. Ensure visual indicators (`docket-drop-indicator`) are properly managed. Both tasks and sections can be reordered via drag-and-drop.
5.  **Data Migrations:** When adding new fields to data structures, add migration logic in `main.ts`'s `loadSettings()` method to handle existing user data gracefully. Use the `version` field in `DocketSettings` for schema versioning.

## Common Operations

- **Adding a setting:** Add to `DocketSettings` in `types.ts`, update `DEFAULT_SETTINGS`, and add UI controls to `settings.ts`.
- **Adding a tab:** Create a new class similar to `DashboardTab`, instantiate it in `DocketView.ts`, add a navigation button in `DocketView.buildNav()`, and handle routing in `DocketView.switchToTab()`.
