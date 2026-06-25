import { describe, expect, it } from "vitest";
import { ancestorFolders, parentPath } from "../src/domain/paths";

describe("vault path helpers", () => {
  it("lists nearest ancestors through the vault root", () => {
    expect(ancestorFolders("a/b/file.md")).toEqual(["a/b", "a", ""]);
    expect(ancestorFolders("file.md")).toEqual([""]);
  });

  it("returns parent paths", () => {
    expect(parentPath("a/b")).toBe("a");
    expect(parentPath("a")).toBe("");
    expect(parentPath("")).toBe("");
  });
});

