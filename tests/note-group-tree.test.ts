import { describe, expect, it } from "vitest";
import { NoteGroupIndex } from "../src/domain/note-group-index";
import { noteGroupTreeChildren } from "../src/ui/note-group-tree";

const sizes = new Map<string, number>([
  ["Note C.md", 100],
  ["File X.png", 1000],
  ["File Y.pdf", 2000]
]);

describe("noteGroupTreeChildren", () => {
  it("shows the note itself and deduped attachments sorted by size", () => {
    const index = new NoteGroupIndex();
    index.rebuild({
      notes: ["Note C.md"],
      fileSize: (path) => sizes.get(path),
      linksByNote: new Map([
        [
          "Note C.md",
          [
            { path: "File X.png", embedded: true },
            { path: "File X.png", embedded: false },
            { path: "File Y.pdf", embedded: true }
          ]
        ]
      ]),
      linkMode: "all-direct-non-note"
    });

    const entry = index.getEntry("Note C.md");
    expect(entry).toBeDefined();
    expect(noteGroupTreeChildren(entry!, (path) => sizes.get(path))).toEqual([
      { path: "Note C.md", size: 100, kind: "note" },
      { path: "File Y.pdf", size: 2000, kind: "attachment" },
      { path: "File X.png", size: 1000, kind: "attachment" }
    ]);
  });
});
