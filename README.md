# File Explorer Size

File Explorer Size is an Obsidian desktop plugin that shows file, folder, and note group sizes directly in the File Explorer, with a ranking view for finding the largest items in your vault.

## Features

- Show file sizes and recursive folder sizes in Obsidian's native File Explorer.
- Toggle size labels quickly from the File Explorer toolbar.
- Highlight large files and folders. The default thresholds are 10 MB for files and 100 MB for folders.
- Switch Markdown notes between physical file size and note group size.
- Calculate note group size as the Markdown note itself plus directly linked non-Markdown files.
- Choose whether note groups count only embedded attachments or all direct non-note file links.
- Keep note group depth at 1: links to other Markdown notes are not recursively counted.
- Deduplicate repeated links to the same attachment within a note group.
- Open a ranking view with tabs for physical files, note groups, and folders that directly contain large files.
- Expand note groups in the ranking view to inspect the note file and its counted attachments.
- Optionally support MAKE.md Navigator when MAKE.md is installed and enabled.

## How folder sizes work

The File Explorer labels use recursive folder sizes, so a folder includes everything inside its subfolders.

The ranking view's **Folders** tab uses a different rule: it ranks folders by the files directly inside each folder, excluding subfolders. This avoids repeated rankings where a deeply nested large folder causes all of its ancestors to appear in the top list.

## How note group sizes work

A note group contains:

1. The Markdown note file itself.
2. Directly linked non-Markdown files, such as images, PDFs, videos, or slide decks.

Markdown note links are not counted recursively. Repeated links to the same attachment inside one note are counted once.

## Commands

- `Toggle File Browser sizes`
- `Toggle MAKE.md Navigator sizes` — only available when MAKE.md is enabled
- `Open size ranking`
- `Recalculate all sizes`

## Optional MAKE.md support

If MAKE.md is enabled, this plugin can also show size labels in MAKE.md Navigator. MAKE.md support is optional. If MAKE.md is not enabled, related settings and commands are hidden.

## Desktop only

This plugin is marked as desktop only because it depends on Obsidian desktop File Explorer DOM structures.

## Development

```bash
pnpm install
pnpm test
pnpm lint
pnpm build
```

The release assets are:

- `manifest.json`
- `main.js`
- `styles.css`

## Known limitations

- Hidden configuration content such as `.obsidian` is not included because the plugin uses Obsidian's Vault API.
- The File Explorer DOM is not a formal public API. Future Obsidian or MAKE.md changes may require adapter updates.

## License

MIT
