export type VaultEventName = "create" | "modify" | "delete" | "rename";

export interface VaultFileEventSource {
  on(name: "create", callback: (path: string, size: number) => void): () => void;
  on(name: "modify", callback: (path: string, size: number) => void): () => void;
  on(name: "delete", callback: (path: string) => void): () => void;
  on(
    name: "rename",
    callback: (newPath: string, oldPath: string) => void
  ): () => void;
}

export interface MutableSizeIndex {
  upsertFile(path: string, size: number): void;
  deleteFile(path: string): boolean;
  renamePath(oldPath: string, newPath: string): boolean;
}

export class IncrementalUpdater {
  private disposers: Array<() => void> = [];
  private notifyTimer: number | undefined;

  constructor(
    private readonly source: VaultFileEventSource,
    private readonly index: MutableSizeIndex,
    private readonly onChange: () => void,
    private readonly requestRebuild: () => void,
    private readonly debounceMs = 80
  ) {}

  start(): void {
    if (this.disposers.length > 0) return;
    this.disposers.push(
      this.source.on("create", (path: string, size: number) => {
        this.index.upsertFile(path, size);
        this.scheduleChange();
      }),
      this.source.on("modify", (path: string, size: number) => {
        this.index.upsertFile(path, size);
        this.scheduleChange();
      }),
      this.source.on("delete", (path: string) => {
        if (!this.index.deleteFile(path)) this.requestRebuild();
        this.scheduleChange();
      }),
      this.source.on("rename", (newPath: string, oldPath: string) => {
        if (!this.index.renamePath(oldPath, newPath)) this.requestRebuild();
        this.scheduleChange();
      })
    );
  }

  stop(): void {
    for (const dispose of this.disposers.splice(0)) dispose();
    if (this.notifyTimer !== undefined) window.clearTimeout(this.notifyTimer);
    this.notifyTimer = undefined;
  }

  private scheduleChange(): void {
    if (this.notifyTimer !== undefined) window.clearTimeout(this.notifyTimer);
    this.notifyTimer = window.setTimeout(() => {
      this.notifyTimer = undefined;
      this.onChange();
    }, this.debounceMs);
  }
}

