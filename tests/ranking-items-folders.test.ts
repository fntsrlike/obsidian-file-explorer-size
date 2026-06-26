import { describe, expect, it } from "vitest";
import { NoteGroupIndex } from "../src/domain/note-group-index";
import { SizeIndex } from "../src/domain/size-index";
import { rankingItemsForMode } from "../src/ui/ranking-items";

describe("folder ranking items", () => {
  it("shows only the deepest folder when ancestors only inherit descendant size", () => {
    const sizeIndex = new SizeIndex();
    sizeIndex.rebuild([{ path: "A/B/C/D/E/F/huge.mov", size: 10_000 }]);

    expect(
      rankingItemsForMode("physical-folders", sizeIndex, new NoteGroupIndex(), 10)
    ).toEqual([{ path: "A/B/C/D/E/F", size: 10_000, kind: "folder" }]);
  });

  it("keeps sibling leaf folders as separate ranking entries", () => {
    const sizeIndex = new SizeIndex();
    sizeIndex.rebuild([
      { path: "A/B/one.mov", size: 10_000 },
      { path: "A/C/two.mov", size: 8_000 }
    ]);

    expect(
      rankingItemsForMode("physical-folders", sizeIndex, new NoteGroupIndex(), 10)
    ).toEqual([
      { path: "A/B", size: 10_000, kind: "folder" },
      { path: "A/C", size: 8_000, kind: "folder" }
    ]);
  });
});
