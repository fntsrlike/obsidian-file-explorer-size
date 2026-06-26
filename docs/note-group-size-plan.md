# Note Group Size Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a note group size mode that displays each Markdown note as its own size plus directly referenced non-note files.

**Architecture:** Keep `SizeIndex` as the physical size source of truth and add `NoteGroupIndex` for Markdown note groups. UI asks a single display-size resolver so File Browser, MAKE.md Navigator, and ranking tabs can switch modes without duplicating logic.

**Tech Stack:** TypeScript, Obsidian Plugin API, pnpm, Vitest, jsdom, ESLint, esbuild

---

## Chunk 1: Domain and settings

### Task 1: Settings

**Files:**
- Modify: `src/settings.ts`
- Modify: `src/settings-tab.ts`
- Modify: `tests/settings.test.ts`

- [ ] Write failing tests for `sizeDisplayMode` and `noteGroupLinkMode` defaults and normalization.
- [ ] Run `pnpm exec vitest run tests/settings.test.ts` and confirm RED.
- [ ] Implement settings types, defaults, normalization, and setting tab controls.
- [ ] Run the test and confirm GREEN.
- [ ] Commit.

### Task 2: Note group index

**Files:**
- Create: `src/domain/note-group-index.ts`
- Create: `tests/note-group-index.test.ts`

- [ ] Write failing tests for note size + direct attachment sizes, duplicate attachment dedupe, embedded-only mode, non-md direct-link mode, md links ignored, missing links ignored, and top-N ranking.
- [ ] Run `pnpm exec vitest run tests/note-group-index.test.ts` and confirm RED.
- [ ] Implement pure `NoteGroupIndex` that accepts note paths, physical file sizes, and extracted links.
- [ ] Run the test and confirm GREEN.
- [ ] Commit.

## Chunk 2: Integration and UI

### Task 3: Link extraction and plugin integration

**Files:**
- Modify: `src/main.ts`
- Modify: `src/domain/note-group-index.ts`

- [ ] Add metadata-cache based link extraction in `main.ts`.
- [ ] Rebuild both indexes on manual recalculation and metadata changes.
- [ ] Add display-size resolver: folders always physical; non-md files physical; md files physical or note group based on setting.
- [ ] Run `pnpm test && pnpm lint && pnpm build`.
- [ ] Commit.

### Task 4: Ranking tabs

**Files:**
- Modify: `src/ui/size-ranking-view.ts`
- Add/modify tests as needed.

- [ ] Change tabs to Physical files / Note groups / Physical folders.
- [ ] Ensure Physical folders always uses physical recursive sizes.
- [ ] Ensure Note groups opens the note file on click.
- [ ] Run `pnpm test && pnpm lint && pnpm build`.
- [ ] Commit.

## Chunk 3: Verification

### Task 5: Obsidian validation

**Files:**
- Runtime only unless fixes are needed.

- [ ] Reload plugin in Obsidian.
- [ ] Confirm no errors.
- [ ] Confirm commands and settings appear.
- [ ] Confirm File Browser and MAKE.md Navigator still work.
- [ ] Commit any fixes.
