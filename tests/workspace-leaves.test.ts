import { describe, expect, it } from "vitest";
import { findNativeFileExplorerLeaf } from "../src/ui/workspace-leaves";

type FakeLeaf = {
  id: string;
  view?: {
    getViewType?: () => string;
    containerEl?: { dataset?: { type?: string } };
  };
};

describe("findNativeFileExplorerLeaf", () => {
  it("prefers the real File Browser leaf over MAKE.md navigator aliases", () => {
    const makeLeaf: FakeLeaf = {
      id: "make",
      view: {
        getViewType: () => "mk-path-view",
        containerEl: { dataset: { type: "mk-path-view" } }
      }
    };
    const nativeLeaf: FakeLeaf = {
      id: "native",
      view: {
        getViewType: () => "file-explorer",
        containerEl: { dataset: { type: "file-explorer" } }
      }
    };

    const workspace = {
      getLeavesOfType: () => [makeLeaf],
      iterateAllLeaves: (callback: (leaf: FakeLeaf) => void) => {
        callback(makeLeaf);
        callback(nativeLeaf);
      }
    };

    expect(findNativeFileExplorerLeaf(workspace)).toBe(nativeLeaf);
  });

  it("does not treat MAKE.md navigator as the native File Browser", () => {
    const makeLeaf: FakeLeaf = {
      id: "make",
      view: {
        getViewType: () => "mk-path-view",
        containerEl: { dataset: { type: "mk-path-view" } }
      }
    };

    expect(
      findNativeFileExplorerLeaf({
        getLeavesOfType: () => [makeLeaf],
        iterateAllLeaves: (callback: (leaf: FakeLeaf) => void) => callback(makeLeaf)
      })
    ).toBeUndefined();
  });
});
