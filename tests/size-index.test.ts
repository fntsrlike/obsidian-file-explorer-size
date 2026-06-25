import { describe, expect, it } from "vitest";
import { SizeIndex } from "../src/domain/size-index";

describe("SizeIndex", () => {
  it("builds recursive folder totals and rankings", () => {
    const index = new SizeIndex();
    index.rebuild([
      { path: "a/one.md", size: 10 },
      { path: "a/b/two.png", size: 30 }
    ]);

    expect(index.getFolderSize("a/b")).toBe(30);
    expect(index.getFolderSize("a")).toBe(40);
    expect(index.getFolderSize("")).toBe(40);
    expect(index.topFiles(2).map((item) => item.path)).toEqual([
      "a/b/two.png",
      "a/one.md"
    ]);
    expect(index.topFolders(10).map((item) => item.path)).toEqual(["a", "a/b"]);
  });

  it("sorts equal sizes by full path", () => {
    const index = new SizeIndex();
    index.rebuild([
      { path: "z.md", size: 10 },
      { path: "a.md", size: 10 }
    ]);
    expect(index.topFiles(2).map((item) => item.path)).toEqual(["a.md", "z.md"]);
  });

  it("increments ancestors for add, modify, and delete", () => {
    const index = new SizeIndex();
    index.rebuild([{ path: "a/original.md", size: 10 }]);

    index.upsertFile("a/b/new.md", 20);
    expect(index.getFolderSize("a")).toBe(30);
    expect(index.getFolderSize("a/b")).toBe(20);

    index.upsertFile("a/b/new.md", 25);
    expect(index.getFolderSize("a")).toBe(35);

    expect(index.deleteFile("a/original.md")).toBe(true);
    expect(index.getFolderSize("a")).toBe(25);
  });

  it("moves files between folders", () => {
    const index = new SizeIndex();
    index.rebuild([{ path: "old/file.md", size: 12 }]);
    expect(index.renamePath("old/file.md", "new/file.md")).toBe(true);
    expect(index.getFileSize("old/file.md")).toBeUndefined();
    expect(index.getFileSize("new/file.md")).toBe(12);
    expect(index.getFolderSize("old")).toBeUndefined();
    expect(index.getFolderSize("new")).toBe(12);
  });

  it("moves folder subtrees", () => {
    const index = new SizeIndex();
    index.rebuild([
      { path: "old/a.md", size: 5 },
      { path: "old/nested/b.md", size: 7 }
    ]);
    expect(index.renamePath("old", "new")).toBe(true);
    expect(index.getFileSize("new/a.md")).toBe(5);
    expect(index.getFileSize("new/nested/b.md")).toBe(7);
    expect(index.getFolderSize("old")).toBeUndefined();
    expect(index.getFolderSize("new")).toBe(12);
  });
});
