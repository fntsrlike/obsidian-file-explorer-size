import { describe, expect, it } from "vitest";
import { formatBytes, isOverThreshold } from "../src/domain/format-size";

describe("formatBytes", () => {
  it("formats automatic binary units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("supports fixed units", () => {
    expect(formatBytes(2048, "B")).toBe("2048 B");
    expect(formatBytes(2048, "KB")).toBe("2 KB");
  });
});

describe("isOverThreshold", () => {
  it("uses a strict greater-than comparison", () => {
    expect(isOverThreshold(10_000_001, 10_000_000)).toBe(true);
    expect(isOverThreshold(10_000_000, 10_000_000)).toBe(false);
  });
});

