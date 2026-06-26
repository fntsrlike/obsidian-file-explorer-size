import { ItemView, setIcon, type WorkspaceLeaf } from "obsidian";
import { formatBytes } from "../domain/format-size";
import type { NoteGroupIndex } from "../domain/note-group-index";
import type { SizeIndex } from "../domain/size-index";
import type { FileExplorerSizeSettings } from "../settings";
import { SIZE_RANKING_ICON_ID } from "./icons";
import { displayNameForPath, parentHintForPath } from "./ranking-paths";
import { rankingItemsForMode, type RankingItem, type RankingMode } from "./ranking-items";

export const SIZE_RANKING_VIEW = "file-explorer-size-ranking";

export interface RankingViewHost {
  index: SizeIndex;
  noteGroupIndex: NoteGroupIndex;
  settings: FileExplorerSizeSettings;
  openFile(path: string): Promise<void>;
  revealFolder(path: string): Promise<void>;
  recalculate(): Promise<void>;
}

export class SizeRankingView extends ItemView {
  private mode: RankingMode = "physical-files";

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
    return SIZE_RANKING_ICON_ID;
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
    this.createTab(tabs, "physical-files", "Files");
    this.createTab(tabs, "note-groups", "Note groups");
    this.createTab(tabs, "physical-folders", "Folders");
    const recalculate = header.createEl("button", {
      cls: "clickable-icon",
      attr: { "aria-label": "Recalculate all sizes" }
    });
    setIcon(recalculate, "refresh-cw");
    recalculate.addEventListener("click", () => void this.host.recalculate());

    const items = rankingItemsForMode(
      this.mode,
      this.host.index,
      this.host.noteGroupIndex,
      this.host.settings.rankingLimit
    );

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
    mode: RankingMode,
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

  private createRow(parent: HTMLElement, item: RankingItem): void {
    const row = parent.createDiv({ cls: "fes-ranking-row" });
    const text = row.createDiv({ cls: "fes-ranking-text" });
    row.setAttribute("title", item.path);
    const name = displayNameForPath(item.path);
    const parentHint = parentHintForPath(item.path);
    text.createDiv({ cls: "fes-ranking-name", text: name });
    if (parentHint) {
      text.createDiv({ cls: "fes-ranking-path", text: parentHint });
    }
    row.createSpan({
      cls: "fes-ranking-size",
      text: formatBytes(item.size, this.host.settings.unit)
    });
    row.addEventListener("click", () => {
      if (item.kind === "folder") void this.host.revealFolder(item.path);
      else void this.host.openFile(item.path);
    });
  }
}

