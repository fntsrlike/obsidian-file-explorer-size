import { describe, expect, it } from "vitest";
import { displayNameForPath, parentHintForPath } from "../src/ui/ranking-paths";

describe("ranking path display", () => {
  it("uses the basename as the primary display name", () => {
    expect(displayNameForPath("a/b/note.md")).toBe("note.md");
    expect(displayNameForPath("root.md")).toBe("root.md");
  });

  it("shows only a shortened parent hint instead of the full path", () => {
    expect(parentHintForPath("X. Main/Area/Topic/note.md")).toBe("… / Topic");
    expect(parentHintForPath("folder/file.pdf")).toBe("… / folder");
    expect(parentHintForPath("root.md")).toBe("");
  });
});
