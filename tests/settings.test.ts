import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/settings";

describe("settings", () => {
  it("provides the agreed defaults", () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      showFileBrowserSizes: true,
      showMakeNavigatorSizes: true,
      fileWarningBytes: 10 * 1024 * 1024,
      folderWarningBytes: 100 * 1024 * 1024,
      rankingLimit: 20,
      unit: "auto",
      includeHidden: false
    });
  });

  it("migrates the legacy shared visibility setting", () => {
    expect(normalizeSettings({ showSizes: false })).toMatchObject({
      showFileBrowserSizes: false,
      showMakeNavigatorSizes: false
    });
  });

  it("normalizes invalid persisted values", () => {
    const settings = normalizeSettings({
      fileWarningBytes: -1,
      folderWarningBytes: Number.NaN,
      rankingLimit: 9999,
      unit: "watts"
    });
    expect(settings.fileWarningBytes).toBe(0);
    expect(settings.folderWarningBytes).toBe(DEFAULT_SETTINGS.folderWarningBytes);
    expect(settings.rankingLimit).toBe(500);
    expect(settings.unit).toBe("auto");
  });
});
