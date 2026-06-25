import { ItemView, setIcon, type WorkspaceLeaf } from "obsidian";
import { formatBytes } from "../domain/format-size";
import type { SizeIndex, SizedPath } from "../domain/size-index";
import type { FileExplorerSizeSettings } from "../settings";

export const SIZE_RANKING_VIEW = "file-explorer-size-ranking";

export interface RankingViewHost {
  index: SizeIndex;
  settings: FileExplorerSizeSettings;
  openFile(path: string): Promise<void>;
  revealFolder(path: string): Promise<void>;
  recalculate(): Promise<void>;
}

export class SizeRankingView extends ItemView {
  private mode: "files" | "folders" = "files";

  constructor(leaf: WorkspaceLeaf, private readonly host: RankingViewHost) {
    super(leaf);
  }

  getViewType(): string {
    return SIZE_RANKING_VIEW;
  }

  getDisplayText(): string {
    return "Size ranking";
  }

  getIcon(): string {
    return "chart-no-axes-column-increasing";
  }

  async onOpen(): Promise<void> {
    this.render();
  }

  refresh(): void {
    if (this.contentEl.isConnected) this.render();
  }

  private render(): void {
    this.contentEl.empty();
    this.contentEl.addClass("fes-ranking");

    const header = this.contentEl.createDiv({ cls: "fes-ranking-header" });
    const tabs = header.createDiv({ cls: "fes-ranking-tabs" });
    this.createTab(tabs, "files", "Files");
    this.createTab(tabs, "folders", "Folders");
    const recalculate = header.createEl("button", {
      cls: "clickable-icon",
      attr: { "aria-label": "Recalculate all sizes" }
    });
    setIcon(recalculate, "refresh-cw");
    recalculate.addEventListener("click", () => void this.host.recalculate());

    const items =
      this.mode === "files"
        ? this.host.index.topFiles(this.host.settings.rankingLimit)
        : this.host.index.topFolders(this.host.settings.rankingLimit);

    if (items.length === 0) {
      this.contentEl.createDiv({
        cls: "fes-ranking-empty",
        text: "No items to display."
      });
      return;
    }
    const list = this.contentEl.createDiv({ cls: "fes-ranking-list" });
    for (const item of items) this.createRow(list, item);
  }

  private createTab(
    parent: HTMLElement,
    mode: "files" | "folders",
    label: string
  ): void {
    const button = parent.createEl("button", {
      cls: `fes-ranking-tab${this.mode === mode ? " is-active" : ""}`,
      text: label
    });
    button.addEventListener("click", () => {
      this.mode = mode;
      this.render();
    });
  }

  private createRow(parent: HTMLElement, item: SizedPath): void {
    const row = parent.createDiv({ cls: "fes-ranking-row" });
    const text = row.createDiv({ cls: "fes-ranking-text" });
    const name = item.path.split("/").pop() ?? item.path;
    text.createDiv({ cls: "fes-ranking-name", text: name });
    text.createDiv({ cls: "fes-ranking-path", text: item.path });
    row.createSpan({
      cls: "fes-ranking-size",
      text: formatBytes(item.size, this.host.settings.unit)
    });
    row.addEventListener("click", () => {
      if (this.mode === "files") void this.host.openFile(item.path);
      else void this.host.revealFolder(item.path);
    });
  }
}

