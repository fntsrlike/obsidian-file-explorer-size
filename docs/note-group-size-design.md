# Note Group Size Design

## Goal

Add an alternate display mode that shows a Markdown note's storage footprint as a group:

```text
note file size + directly referenced non-note attachment sizes
```

This lets users understand how much space a note and its associated files use, regardless of where attachments are stored.

## Scope

### Size display mode

Add a setting named `Size display mode`:

1. `Physical file size`
   - Current behavior.
   - Files show their own size.
   - Folders show recursive physical size.

2. `Note group size`
   - Markdown files show note group size.
   - Non-Markdown files still show their own physical size.
   - Folder labels in the file tree should continue to show physical folder size, not summed note group size.

### Note group link mode

Add a setting named `Note group link mode`:

1. `Embedded attachments only`
   - Count directly embedded non-note files.
   - Examples:
     - `![[file.pdf]]`
     - `![image](image.png)`

2. `All direct non-note file links` — default
   - Count all directly linked or embedded non-note files.
   - Examples:
     - `![[file.pdf]]`
     - `[[file.pdf]]`
     - `![image](image.png)`
     - `[slides](slides.pdf)`

## Counting rules

- A Markdown note always includes its own `.md` file size.
- `[[another note]]` does not count.
- Direct links to non-Markdown files count according to the selected link mode.
- Embedded Markdown notes do not recurse.
  - `![[another note]]` may count the embedded note file itself only if future settings explicitly enable that; in the first implementation it should not add the embedded note's attachments.
- The graph depth is exactly 1.
- The same linked attachment counts at most once per source note.
- External URLs do not count.
- Missing or unresolved links do not count.
- Vault-external local files do not count.
- Canvas, PDF, PPTX, images, audio, video, and other non-md Vault files are all attachments for this feature.

## Data model

Keep the existing physical `SizeIndex` as the source of truth for physical file and folder sizes.

Add a `NoteGroupIndex`:

```ts
interface NoteGroupEntry {
  notePath: string;
  noteSize: number;
  attachmentPaths: string[];
  attachmentSize: number;
  totalSize: number;
}
```

Responsibilities:

- Build entries for Markdown files only.
- Resolve direct links through Obsidian `metadataCache`.
- Use physical file sizes from `SizeIndex`.
- Deduplicate attachments per note.
- Provide top-N note group ranking.
- Update when:
  - A note changes.
  - A referenced attachment changes size.
  - A file is renamed or deleted.
  - Metadata cache resolves links after parsing.

## Link extraction

Use Obsidian metadata where possible:

- `metadataCache.getFileCache(note)`
- `cache.embeds`
- `cache.links`

Resolution should use:

```ts
app.metadataCache.getFirstLinkpathDest(link, sourcePath)
```

Only count resolved `TFile` entries where `extension !== "md"`.

For Markdown links such as `[text](relative-file.pdf)`, use metadata cache link information if available. If Obsidian does not expose enough detail for all Markdown resource links, add a small parser fallback for local relative URLs.

## UI behavior

### File Browser and MAKE.md Navigator

When `Size display mode = Physical file size`:

- Existing behavior.

When `Size display mode = Note group size`:

- Markdown files show note group size.
- Non-Markdown files show physical size.
- Folders show physical recursive size.
- Warning color for Markdown notes uses the file warning threshold against the displayed note group size.
- Tooltip should eventually show a breakdown:

```text
Note: 12 KB
Attachments: 18.4 MB
Total: 18.4 MB
```

Tooltip breakdown can be implemented after the core mode if needed.

### Ranking view

Replace the current two ranking tabs with three:

1. `Physical files`
2. `Note groups`
3. `Physical folders`

`Physical folders` always uses physical recursive folder sizes, regardless of display mode. This avoids double-counting shared attachments referenced by multiple notes.

## Settings

Add:

- `Size display mode`
  - `Physical file size`
  - `Note group size`
- `Note group link mode`
  - `Embedded attachments only`
  - `All direct non-note file links`

Existing File Browser and MAKE.md Navigator visibility settings remain independent.

## Incremental update strategy

Initial implementation may rebuild `NoteGroupIndex` when metadata changes, because correctness matters more than premature optimization.

Target behavior:

- Physical file size changes update `SizeIndex` incrementally as today.
- If a non-md file size changes, recompute note group entries that reference that file.
- If a Markdown note changes or its metadata cache updates, recompute only that note's group entry.
- If a file is renamed, recompute affected notes using metadata cache after Obsidian updates links.
- Manual `Recalculate all sizes` rebuilds both indexes.

## Acceptance criteria

1. User can choose between physical file size and note group size.
2. Markdown notes display note group size in note group mode.
3. Non-md files display physical size in both modes.
4. Folders always display physical recursive size.
5. `[[another note]]` does not increase note group size.
6. Direct non-md links count in `All direct non-note file links` mode.
7. Embedded non-md links count in both note group link modes.
8. Duplicate attachment links in the same note count once.
9. Missing and external links do not count.
10. Ranking view includes Physical files, Note groups, and Physical folders.
11. Existing File Browser and MAKE.md Navigator visibility controls still work independently.
12. Tests cover link extraction, note group totals, ranking, settings, and display mode selection.
