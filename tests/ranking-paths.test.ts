import { describe, expect, it } from "vitest";
import { displayNameForPath } from "../src/ui/ranking-paths";

describe("ranking path display", () => {
  it("uses the basename as the primary display name", () => {
    expect(displayNameForPath("a/b/note.md")).toBe("note.md");
    expect(displayNameForPath("root.md")).toBe("root.md");
  });
});
