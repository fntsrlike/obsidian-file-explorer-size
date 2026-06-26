import { describe, expect, it } from "vitest";
import { rankingItemsForMode } from "../src/ui/ranking-items";
import { NoteGroupIndex } from "../src/domain/note-group-index";
import { SizeIndex } from "../src/domain/size-index";

function buildIndexes(): { sizeIndex: SizeIndex; noteGroupIndex: NoteGroupIndex } {
  const sizeIndex = new SizeIndex();
  sizeIndex.rebuild([
    { path: "note.md", size: 100 },
    { path: "folder/asset.png", size: 1000 },
    { path: "other.pdf", size: 500 }
  ]);
  const noteGroupIndex = new NoteGroupIndex();
  noteGroupIndex.rebuild({
    notes: ["note.md"],
    fileSize: (path) => sizeIndex.getFileSize(path),
    linksByNote: new Map([["note.md", [{ path: "folder/asset.png", embedded: true }]]]),
    linkMode: "all-direct-non-note"
  });
  return { sizeIndex, noteGroupIndex };
}

describe("rankingItemsForMode", () => {
  it("returns physical files, note groups, and physical folders from separate sources", () => {
    const { sizeIndex, noteGroupIndex } = buildIndexes();

    expect(rankingItemsForMode("physical-files", sizeIndex, noteGroupIndex, 2)).toEqual([
      { path: "folder/asset.png", size: 1000, kind: "file" },
      { path: "other.pdf", size: 500, kind: "file" }
    ]);
    expect(rankingItemsForMode("note-groups", sizeIndex, noteGroupIndex, 2)).toEqual([
      { path: "note.md", size: 1100, kind: "note-group" }
    ]);
    expect(rankingItemsForMode("physical-folders", sizeIndex, noteGroupIndex, 2)).toEqual([
      { path: "folder", size: 1000, kind: "folder" }
    ]);
  });
});
