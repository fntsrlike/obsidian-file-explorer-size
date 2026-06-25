import { describe, expect, it, vi } from "vitest";
import { IncrementalUpdater, type VaultFileEventSource } from "../src/services/incremental-updater";

function source(): VaultFileEventSource & {
  emit: (name: string, ...args: unknown[]) => void;
  disposed: () => number;
} {
  const handlers = new Map<string, (...args: any[]) => void>();
  let disposeCount = 0;
  return {
    on(name, callback) {
      handlers.set(name, callback);
      return () => {
        disposeCount += 1;
        handlers.delete(name);
      };
    },
    emit(name, ...args) {
      handlers.get(name)?.(...args);
    },
    disposed: () => disposeCount
  };
}

describe("IncrementalUpdater", () => {
  it("translates vault events to index operations", () => {
    vi.useFakeTimers();
    const events = source();
    const index = {
      upsertFile: vi.fn(),
      deleteFile: vi.fn(() => true),
      renamePath: vi.fn(() => true)
    };
    const onChange = vi.fn();
    const updater = new IncrementalUpdater(events, index, onChange, vi.fn(), 20);
    updater.start();

    events.emit("create", "a.md", 10);
    events.emit("modify", "a.md", 12);
    events.emit("delete", "a.md");
    events.emit("rename", "b.md", "a.md");

    expect(index.upsertFile).toHaveBeenNthCalledWith(1, "a.md", 10);
    expect(index.upsertFile).toHaveBeenNthCalledWith(2, "a.md", 12);
    expect(index.deleteFile).toHaveBeenCalledWith("a.md");
    expect(index.renamePath).toHaveBeenCalledWith("a.md", "b.md");
    vi.advanceTimersByTime(20);
    expect(onChange).toHaveBeenCalledTimes(1);
    updater.stop();
    expect(events.disposed()).toBe(4);
    vi.useRealTimers();
  });

  it("requests a rebuild when an event cannot be reconciled", () => {
    const events = source();
    const rebuild = vi.fn();
    const updater = new IncrementalUpdater(
      events,
      { upsertFile: vi.fn(), deleteFile: () => false, renamePath: () => false },
      vi.fn(),
      rebuild
    );
    updater.start();
    events.emit("delete", "unknown.md");
    expect(rebuild).toHaveBeenCalledTimes(1);
    updater.stop();
  });
});

