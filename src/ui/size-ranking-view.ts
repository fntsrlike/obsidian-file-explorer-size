import { ItemView, setIcon, type WorkspaceLeaf } from "obsidian";
import { formatBytes } from "../domain/format-size";
import type { NoteGroupIndex } from "../domain/note-group-index";
import type { SizeIndex } from "../domain/size-index";
import type { FileExplorerSizeSettings } from "../settings";
import { SIZE_RANKING_ICON_ID } from "./icons";
import { noteGroupTreeChildren, type NoteGroupTreeChild } from "./note-group-tree";
import { displayNameForPath } from "./ranking-paths";
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
  private readonly expandedNoteGroups = new Set<string>();

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
    for (const item of items) {
      this.createRow(list, item);
      if (item.kind === "note-group" && this.expandedNoteGroups.has(item.path)) {
        this.createNoteGroupChildren(list, item.path);
      }
    }
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
    row.setAttribute("aria-label", item.path);
    if (item.kind === "note-group") {
      this.createNoteGroupToggle(row, item.path);
    }
    const text = row.createDiv({ cls: "fes-ranking-text" });
    const name = displayNameForPath(item.path);
    text.createDiv({ cls: "fes-ranking-name", text: name });
    row.createSpan({
      cls: "fes-ranking-size",
      text: formatBytes(item.size, this.host.settings.unit)
    });
    row.addEventListener("click", () => {
      if (item.kind === "folder") void this.host.revealFolder(item.path);
      else void this.host.openFile(item.path);
    });
  }

  private createNoteGroupToggle(parent: HTMLElement, notePath: string): void {
    const expanded = this.expandedNoteGroups.has(notePath);
    const toggle = parent.createEl("button", {
      cls: "clickable-icon fes-ranking-expander",
      attr: {
        "aria-label": expanded ? "Collapse note group" : "Expand note group",
        "aria-expanded": String(expanded)
      }
    });
    setIcon(toggle, expanded ? "chevron-down" : "chevron-right");
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (expanded) this.expandedNoteGroups.delete(notePath);
      else this.expandedNoteGroups.add(notePath);
      this.render();
    });
  }

  private createNoteGroupChildren(parent: HTMLElement, notePath: string): void {
    const entry = this.host.noteGroupIndex.getEntry(notePath);
    if (!entry) return;
    for (const child of noteGroupTreeChildren(entry, (path) =>
      this.host.index.getFileSize(path)
    )) {
      this.createNoteGroupChildRow(parent, child);
    }
  }

  private createNoteGroupChildRow(
    parent: HTMLElement,
    child: NoteGroupTreeChild
  ): void {
    const row = parent.createDiv({
      cls: `fes-ranking-row fes-ranking-child is-${child.kind}`
    });
    row.setAttribute("aria-label", child.path);
    const text = row.createDiv({ cls: "fes-ranking-text" });
    text.createDiv({ cls: "fes-ranking-name", text: displayNameForPath(child.path) });
    row.createSpan({
      cls: "fes-ranking-size",
      text: formatBytes(child.size, this.host.settings.unit)
    });
    row.addEventListener("click", () => void this.host.openFile(child.path));
  }
}

