import type { NoteGroupIndex } from "../domain/note-group-index";
import type { SizeIndex } from "../domain/size-index";

export type RankingMode = "physical-files" | "note-groups" | "physical-folders";
export type RankingItemKind = "file" | "note-group" | "folder";

export interface RankingItem {
  path: string;
  size: number;
  kind: RankingItemKind;
}

export function rankingItemsForMode(
  mode: RankingMode,
  sizeIndex: SizeIndex,
  noteGroupIndex: NoteGroupIndex,
  limit: number
): RankingItem[] {
  if (mode === "physical-files") {
    return sizeIndex
      .topFiles(limit)
      .map((item) => ({ ...item, kind: "file" }));
  }
  if (mode === "note-groups") {
    return noteGroupIndex
      .topNoteGroups(limit)
      .map((entry) => ({
        path: entry.notePath,
        size: entry.totalSize,
        kind: "note-group"
      }));
  }
  return sizeIndex
    .topContainingFolders(limit)
    .map((item) => ({ ...item, kind: "folder" }));
}
