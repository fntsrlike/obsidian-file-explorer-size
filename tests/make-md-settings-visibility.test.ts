import { describe, expect, it } from "vitest";
import { shouldShowMakeNavigatorSettings } from "../src/settings-visibility";

describe("MAKE.md settings visibility", () => {
  it("shows MAKE Navigator settings only when MAKE.md is enabled", () => {
    expect(shouldShowMakeNavigatorSettings({ installed: true, enabled: true })).toBe(true);
    expect(shouldShowMakeNavigatorSettings({ installed: true, enabled: false })).toBe(false);
    expect(shouldShowMakeNavigatorSettings({ installed: false, enabled: false })).toBe(false);
  });
});
