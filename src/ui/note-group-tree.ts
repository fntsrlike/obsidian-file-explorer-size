import type { NoteGroupEntry } from "../domain/note-group-index";

export interface NoteGroupTreeChild {
  path: string;
  size: number;
  kind: "note" | "attachment";
}

export function noteGroupTreeChildren(
  entry: NoteGroupEntry,
  fileSize: (path: string) => number | undefined
): NoteGroupTreeChild[] {
  const note: NoteGroupTreeChild = {
    path: entry.notePath,
    size: entry.noteSize,
    kind: "note"
  };
  const attachments = entry.attachmentPaths
    .map((path) => ({
      path,
      size: fileSize(path) ?? 0,
      kind: "attachment" as const
    }))
    .sort((a, b) => b.size - a.size || a.path.localeCompare(b.path));
  return [note, ...attachments];
}
