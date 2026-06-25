import { isOverThreshold } from "../domain/format-size";
import { isFolderRow, rowsWithin } from "./file-explorer-adapter";

export interface FileExplorerDecoratorOptions {
  roots: () => HTMLElement[];
  sizeFor: (path: string, folder: boolean) => number | undefined;
  format: (size: number) => string;
  fileWarningBytes: () => number;
  folderWarningBytes: () => number;
  shown: () => boolean;
  onToggle: (shown: boolean) => void;
}

export class FileExplorerDecorator {
  private observers: MutationObserver[] = [];

  constructor(private readonly options: FileExplorerDecoratorOptions) {}

  start(): void {
    this.stop();
    for (const root of this.options.roots()) {
      this.decorateRoot(root);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) this.decorateNode(node);
          }
        }
      });
      observer.observe(root, { childList: true, subtree: true });
      this.observers.push(observer);
    }
  }

  stop(): void {
    for (const observer of this.observers.splice(0)) observer.disconnect();
    for (const root of this.options.roots()) {
      root.classList.remove("fes-sizes-hidden");
      root.querySelectorAll(".fes-size-label").forEach((label) => label.remove());
    }
  }

  refresh(): void {
    for (const root of this.options.roots()) this.decorateRoot(root);
  }

  toggle(): void {
    const next = !this.options.shown();
    this.options.onToggle(next);
    this.applyVisibility();
  }

  private decorateRoot(root: HTMLElement): void {
    this.applyVisibility(root);
    this.decorateNode(root);
  }

  private decorateNode(node: HTMLElement): void {
    for (const row of rowsWithin(node)) this.decorateRow(row);
  }

  private decorateRow(row: HTMLElement): void {
    const rawPath = row.dataset.path;
    const path = rawPath === "/" ? "" : rawPath;
    if (!path) return;
    const folder = isFolderRow(row);
    const size = this.options.sizeFor(path, folder);
    const existing = row.querySelector<HTMLElement>(":scope > .fes-size-label");
    if (size === undefined) {
      existing?.remove();
      return;
    }

    const label = existing ?? document.createElement("span");
    label.className = "fes-size-label";
    label.textContent = this.options.format(size);
    const threshold = folder
      ? this.options.folderWarningBytes()
      : this.options.fileWarningBytes();
    label.classList.toggle("is-warning", isOverThreshold(size, threshold));
    if (!existing) row.append(label);
  }

  private applyVisibility(root?: HTMLElement): void {
    const roots = root ? [root] : this.options.roots();
    for (const item of roots) {
      item.classList.toggle("fes-sizes-hidden", !this.options.shown());
    }
  }
}
