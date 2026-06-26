import { describe, expect, it } from "vitest";
import { NoteGroupIndex } from "../src/domain/note-group-index";

const files = new Map<string, number>([
  ["note.md", 100],
  ["other.md", 200],
  ["image.png", 1000],
  ["slides.pdf", 2000],
  ["clip.mov", 3000]
]);

describe("NoteGroupIndex", () => {
  it("adds note size and direct non-note links in all-direct mode", () => {
    const index = new NoteGroupIndex();
    index.rebuild({
      notes: ["note.md"],
      fileSize: (path) => files.get(path),
      linksByNote: new Map([
        [
          "note.md",
          [
            { path: "image.png", embedded: true },
            { path: "slides.pdf", embedded: false },
            { path: "other.md", embedded: false }
          ]
        ]
      ]),
      linkMode: "all-direct-non-note"
    });

    expect(index.getNoteGroupSize("note.md")).toBe(3100);
    expect(index.getEntry("note.md")?.attachmentPaths).toEqual([
      "image.png",
      "slides.pdf"
    ]);
  });

  it("counts only embedded attachments in embedded-only mode", () => {
    const index = new NoteGroupIndex();
    index.rebuild({
      notes: ["note.md"],
      fileSize: (path) => files.get(path),
      linksByNote: new Map([
        [
          "note.md",
          [
            { path: "image.png", embedded: true },
            { path: "slides.pdf", embedded: false }
          ]
        ]
      ]),
      linkMode: "embedded-only"
    });

    expect(index.getNoteGroupSize("note.md")).toBe(1100);
  });

  it("deduplicates repeated attachments and ignores missing files", () => {
    const index = new NoteGroupIndex();
    index.rebuild({
      notes: ["note.md"],
      fileSize: (path) => files.get(path),
      linksByNote: new Map([
        [
          "note.md",
          [
            { path: "image.png", embedded: true },
            { path: "image.png", embedded: false },
            { path: "missing.pdf", embedded: true }
          ]
        ]
      ]),
      linkMode: "all-direct-non-note"
    });

    expect(index.getNoteGroupSize("note.md")).toBe(1100);
  });

  it("ranks note groups by total size", () => {
    const index = new NoteGroupIndex();
    index.rebuild({
      notes: ["note.md", "other.md"],
      fileSize: (path) => files.get(path),
      linksByNote: new Map([
        ["note.md", [{ path: "image.png", embedded: true }]],
        ["other.md", [{ path: "clip.mov", embedded: true }]]
      ]),
      linkMode: "all-direct-non-note"
    });

    expect(index.topNoteGroups(2).map((entry) => entry.notePath)).toEqual([
      "other.md",
      "note.md"
    ]);
  });
});

