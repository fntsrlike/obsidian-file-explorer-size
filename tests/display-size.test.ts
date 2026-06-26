import { describe, expect, it } from "vitest";
import { resolveDisplaySize } from "../src/domain/display-size";

describe("resolveDisplaySize", () => {
  it("always uses physical sizes for folders", () => {
    expect(
      resolveDisplaySize({
        path: "folder",
        folder: true,
        mode: "note-group",
        physicalSize: () => 123,
        noteGroupSize: () => 999
      })
    ).toBe(123);
  });

  it("uses note group size for markdown notes only in note-group mode", () => {
    expect(
      resolveDisplaySize({
        path: "note.md",
        folder: false,
        mode: "note-group",
        physicalSize: () => 100,
        noteGroupSize: () => 1100
      })
    ).toBe(1100);
  });

  it("uses physical size for non-md files and physical mode", () => {
    expect(
      resolveDisplaySize({
        path: "file.pdf",
        folder: false,
        mode: "note-group",
        physicalSize: () => 500,
        noteGroupSize: () => undefined
      })
    ).toBe(500);
    expect(
      resolveDisplaySize({
        path: "note.md",
        folder: false,
        mode: "physical",
        physicalSize: () => 100,
        noteGroupSize: () => 1100
      })
    ).toBe(100);
  });
});

