import {
  Notice,
  Plugin,
  TFile,
  type EventRef,
  type TAbstractFile
} from "obsidian";
import { resolveDisplaySize } from "./domain/display-size";
import { formatBytes } from "./domain/format-size";
import {
  NoteGroupIndex,
  type NoteGroupLink
} from "./domain/note-group-index";
import { SizeIndex } from "./domain/size-index";
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  type FileExplorerSizeSettings
} from "./settings";
import { FileExplorerSizeSettingTab } from "./settings-tab";
import {
  IncrementalUpdater,
  type VaultEventName,
  type VaultFileEventSource
} from "./services/incremental-updater";
import { extractNoteGroupLinksFromCache } from "./services/note-link-extractor";
import {
  fileBrowserRoots,
  installToggleActions,
  makeNavigatorRoots
} from "./ui/file-explorer-adapter";
import { FileExplorerDecorator } from "./ui/file-explorer-decorator";
import {
  SIZE_RANKING_VIEW,
  SizeRankingView
} from "./ui/size-ranking-view";

interface FileExplorerViewLike {
  revealInFolder?: (file: TAbstractFile) => Promise<void> | void;
}

export default class FileExplorerSizePlugin extends Plugin {
  settings: FileExplorerSizeSettings = { ...DEFAULT_SETTINGS };
  readonly index = new SizeIndex();
  readonly noteGroupIndex = new NoteGroupIndex();
  private fileBrowserDecorator: FileExplorerDecorator | undefined;
  private makeNavigatorDecorator: FileExplorerDecorator | undefined;
  private updater: IncrementalUpdater | undefined;
  private removeToolbarActions: (() => void) | undefined;
  private rebuildPromise: Promise<void> | undefined;

  async onload(): Promise<void> {
    this.settings = normalizeSettings((await this.loadData()) ?? {});
    this.addSettingTab(new FileExplorerSizeSettingTab(this.app, this));
    this.registerView(
      SIZE_RANKING_VIEW,
      (leaf) => new SizeRankingView(leaf, this)
    );

    this.addCommand({
      id: "toggle-file-browser-sizes",
      name: "Toggle File Browser sizes",
      callback: () =>
        void this.setFileBrowserSizesShown(!this.settings.showFileBrowserSizes)
    });
    if (this.isMakeMdEnabled()) {
      this.addCommand({
        id: "toggle-make-navigator-sizes",
        name: "Toggle MAKE.md Navigator sizes",
        callback: () =>
          void this.setMakeNavigatorSizesShown(
            !this.settings.showMakeNavigatorSizes
          )
      });
    }
    this.addCommand({
      id: "open-size-ranking",
      name: "Open size ranking",
      callback: () => void this.openRanking()
    });
    this.addCommand({
      id: "recalculate-all-sizes",
      name: "Recalculate all sizes",
      callback: () => void this.recalculate()
    });
    this.addRibbonIcon(
      "chart-no-axes-column-increasing",
      "Open size ranking",
      () => void this.openRanking()
    );

    this.app.workspace.onLayoutReady(() => {
      void this.initialize();
    });
  }

  onunload(): void {
    this.updater?.stop();
    this.fileBrowserDecorator?.stop();
    this.makeNavigatorDecorator?.stop();
    this.removeToolbarActions?.();
  }

  async saveSettings(): Promise<void> {
    this.settings = normalizeSettings(this.settings);
    await this.saveData(this.settings);
  }

  refreshUi(): void {
    this.fileBrowserDecorator?.refresh();
    this.makeNavigatorDecorator?.refresh();
    for (const leaf of this.app.workspace.getLeavesOfType(SIZE_RANKING_VIEW)) {
      const view = leaf.view;
      if (view instanceof SizeRankingView) view.refresh();
    }
  }

  async recalculate(): Promise<void> {
    await this.rebuildAndRefresh({ notify: true });
  }

  private async rebuildAndRefresh(options?: { notify?: boolean }): Promise<void> {
    if (this.rebuildPromise) return this.rebuildPromise;
    this.rebuildPromise = this.rebuild()
      .then(() => {
        this.refreshUi();
        if (options?.notify) new Notice("File and folder sizes recalculated.");
      })
      .catch((error: unknown) => {
        console.error("File Explorer Size: rebuild failed", error);
        if (options?.notify) new Notice("Failed to recalculate file sizes.");
      })
      .finally(() => {
        this.rebuildPromise = undefined;
      });
    return this.rebuildPromise;
  }

  async openFile(path: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) await this.app.workspace.getLeaf(false).openFile(file);
  }

  async revealFolder(path: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(path);
    if (!folder) return;
    const leaf = this.app.workspace.getLeavesOfType("file-explorer")[0];
    const view = leaf?.view as unknown as FileExplorerViewLike | undefined;
    if (view?.revealInFolder) await view.revealInFolder(folder);
  }

  private async initialize(): Promise<void> {
    await this.rebuild();
    this.fileBrowserDecorator = new FileExplorerDecorator({
      roots: fileBrowserRoots,
      sizeFor: (path, folder) => this.getDisplaySize(path, folder),
      format: (size) => formatBytes(size, this.settings.unit),
      fileWarningBytes: () => this.settings.fileWarningBytes,
      folderWarningBytes: () => this.settings.folderWarningBytes,
      shown: () => this.settings.showFileBrowserSizes,
      onToggle: (shown) => void this.setFileBrowserSizesShown(shown)
    });
    this.makeNavigatorDecorator = new FileExplorerDecorator({
      roots: makeNavigatorRoots,
      sizeFor: (path, folder) => this.getDisplaySize(path, folder),
      format: (size) => formatBytes(size, this.settings.unit),
      fileWarningBytes: () => this.settings.fileWarningBytes,
      folderWarningBytes: () => this.settings.folderWarningBytes,
      shown: () => this.settings.showMakeNavigatorSizes,
      onToggle: () => {}
    });
    this.fileBrowserDecorator.start();
    this.makeNavigatorDecorator.start();
    this.installToolbarActions();

    this.updater = new IncrementalUpdater(
      this.createEventSource(),
      this.index,
      () => {
        this.rebuildNoteGroups();
        this.refreshUi();
      },
      () => void this.rebuildAndRefresh()
    );
    this.updater.start();

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.fileBrowserDecorator?.start();
        this.makeNavigatorDecorator?.start();
        this.installToolbarActions();
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file.extension === "md") {
          this.rebuildNoteGroups();
          this.refreshUi();
        }
      })
    );
  }

  private async rebuild(): Promise<void> {
    const files = this.app.vault.getFiles();
    this.index.rebuild(
      files.map((file) => ({
        path: file.path,
        size: file.stat.size
      }))
    );
    this.rebuildNoteGroups(files);
  }

  private rebuildNoteGroups(files = this.app.vault.getFiles()): void {
    this.noteGroupIndex.rebuild({
      notes: files.filter((file) => file.extension === "md").map((file) => file.path),
      fileSize: (path) => this.index.getFileSize(path),
      linksByNote: this.extractNoteGroupLinks(files),
      linkMode: this.settings.noteGroupLinkMode
    });
  }

  private getDisplaySize(path: string, folder: boolean): number | undefined {
    return resolveDisplaySize({
      path,
      folder,
      mode: this.settings.sizeDisplayMode,
      physicalSize: (targetPath, targetFolder) =>
        targetFolder
          ? this.index.getFolderSize(targetPath)
          : this.index.getFileSize(targetPath),
      noteGroupSize: (targetPath) =>
        this.noteGroupIndex.getNoteGroupSize(targetPath)
    });
  }

  private extractNoteGroupLinks(files: TFile[]): Map<string, NoteGroupLink[]> {
    const linksByNote = new Map<string, NoteGroupLink[]>();
    for (const note of files.filter((file) => file.extension === "md")) {
      const cache = this.app.metadataCache.getFileCache(note);
      const links: NoteGroupLink[] = [];
      for (const link of extractNoteGroupLinksFromCache(cache)) {
        const target = this.app.metadataCache.getFirstLinkpathDest(
          link.linktext,
          note.path
        );
        if (target instanceof TFile) {
          links.push({ path: target.path, embedded: link.embedded });
        }
      }
      linksByNote.set(note.path, links);
    }
    return linksByNote;
  }

  async setFileBrowserSizesShown(shown: boolean): Promise<void> {
    this.settings.showFileBrowserSizes = shown;
    await this.saveSettings();
    this.fileBrowserDecorator?.refresh();
  }

  async setMakeNavigatorSizesShown(shown: boolean): Promise<void> {
    this.settings.showMakeNavigatorSizes = shown;
    await this.saveSettings();
    this.makeNavigatorDecorator?.refresh();
  }

  private installToolbarActions(): void {
    this.removeToolbarActions?.();
    this.removeToolbarActions = installToggleActions(() =>
      this.fileBrowserDecorator?.toggle()
    );
  }

  isMakeMdInstalled(): boolean {
    const plugins = (this.app as unknown as { plugins: unknown })
      .plugins as {
      manifests?: Record<string, unknown>;
    };
    return Boolean(plugins.manifests?.["make-md"]);
  }

  isMakeMdEnabled(): boolean {
    const plugins = (this.app as unknown as { plugins: unknown })
      .plugins as {
      enabledPlugins?: Set<string>;
    };
    return Boolean(plugins.enabledPlugins?.has("make-md"));
  }

  private async openRanking(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(SIZE_RANKING_VIEW)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf("tab");
      await leaf.setViewState({ type: SIZE_RANKING_VIEW, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
  }

  private createEventSource(): VaultFileEventSource {
    const vault = this.app.vault;
    return {
      on: (name: VaultEventName, callback: (...args: any[]) => void) => {
        let ref: EventRef;
        if (name === "rename") {
          ref = vault.on("rename", (file, oldPath) => {
            callback(file.path, oldPath);
          });
        } else if (name === "delete") {
          ref = vault.on("delete", (file) => callback(file.path));
        } else if (name === "create") {
          ref = vault.on("create", (file) => {
            if (file instanceof TFile) callback(file.path, file.stat.size);
          });
        } else {
          ref = vault.on("modify", (file) => {
            if (file instanceof TFile) callback(file.path, file.stat.size);
          });
        }
        return () => vault.offref(ref);
      }
    };
  }
}
