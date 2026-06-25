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
});

