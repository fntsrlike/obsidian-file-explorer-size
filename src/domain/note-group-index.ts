import type { NoteGroupLinkMode } from "../settings";

export interface NoteGroupLink {
  path: string;
  embedded: boolean;
}

export interface NoteGroupEntry {
  notePath: string;
  noteSize: number;
  attachmentPaths: string[];
  attachmentSize: number;
  totalSize: number;
}

export interface NoteGroupRebuildInput {
  notes: string[];
  fileSize: (path: string) => number | undefined;
  linksByNote: Map<string, NoteGroupLink[]>;
  linkMode: NoteGroupLinkMode;
}

function isMarkdownPath(path: string): boolean {
  return path.toLowerCase().endsWith(".md");
}

function sortEntries(entries: NoteGroupEntry[], limit: number): NoteGroupEntry[] {
  return entries
    .sort(
      (a, b) => b.totalSize - a.totalSize || a.notePath.localeCompare(b.notePath)
    )
    .slice(0, Math.max(0, limit));
}

export class NoteGroupIndex {
  private entries = new Map<string, NoteGroupEntry>();

  rebuild(input: NoteGroupRebuildInput): void {
    const next = new Map<string, NoteGroupEntry>();

    for (const notePath of input.notes) {
      const noteSize = input.fileSize(notePath) ?? 0;
      const seen = new Set<string>();
      const attachmentPaths: string[] = [];
      let attachmentSize = 0;

      for (const link of input.linksByNote.get(notePath) ?? []) {
        if (input.linkMode === "embedded-only" && !link.embedded) continue;
        if (isMarkdownPath(link.path)) continue;
        if (seen.has(link.path)) continue;
        const size = input.fileSize(link.path);
        if (size === undefined) continue;
        seen.add(link.path);
        attachmentPaths.push(link.path);
        attachmentSize += size;
      }

      attachmentPaths.sort((a, b) => a.localeCompare(b));
      next.set(notePath, {
        notePath,
        noteSize,
        attachmentPaths,
        attachmentSize,
        totalSize: noteSize + attachmentSize
      });
    }

    this.entries = next;
  }

  getEntry(notePath: string): NoteGroupEntry | undefined {
    return this.entries.get(notePath);
  }

  getNoteGroupSize(notePath: string): number | undefined {
    return this.entries.get(notePath)?.totalSize;
  }

  topNoteGroups(limit: number): NoteGroupEntry[] {
    return sortEntries([...this.entries.values()], limit);
  }
}

