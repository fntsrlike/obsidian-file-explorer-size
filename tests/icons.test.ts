import { describe, expect, it } from "vitest";
import {
  SIZE_RANKING_ICON_ID,
  fileExplorerSizeToolbarSvg,
  sizeRankingIconSvg
} from "../src/ui/icons";

describe("file explorer size icons", () => {
  it("keeps the toolbar icon as the three-line MB toggle", () => {
    const toolbar = fileExplorerSizeToolbarSvg();
    expect(toolbar).toContain("MB");
    expect(toolbar).toContain("M2 5h13M2 10h13M2 15h13");
  });

  it("uses the existing ranking chart shape with an MB overlay for the ranking tab", () => {
    expect(SIZE_RANKING_ICON_ID).toBe("file-explorer-size-ranking-mb");
    expect(sizeRankingIconSvg).toContain("MB");
    expect(sizeRankingIconSvg).toContain('x1="25"');
    expect(sizeRankingIconSvg).toContain('x1="50"');
    expect(sizeRankingIconSvg).toContain('x1="75"');
    expect(sizeRankingIconSvg).toContain('font-size="28"');
  });
});
