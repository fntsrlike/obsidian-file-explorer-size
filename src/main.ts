import {
  Notice,
  Plugin,
  TFile,
  type EventRef,
  type TAbstractFile
} from "obsidian";
import { formatBytes } from "./domain/format-size";
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
import {
  explorerRoots,
  installToggleActions
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
  private decorator: FileExplorerDecorator | undefined;
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
      id: "toggle-size-display",
      name: "Toggle size display",
      callback: () => void this.setSizesShown(!this.settings.showSizes)
    });
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
    this.decorator?.stop();
    this.removeToolbarActions?.();
  }

  async saveSettings(): Promise<void> {
    this.settings = normalizeSettings(this.settings);
    await this.saveData(this.settings);
  }

  refreshUi(): void {
    this.decorator?.refresh();
    for (const leaf of this.app.workspace.getLeavesOfType(SIZE_RANKING_VIEW)) {
      const view = leaf.view;
      if (view instanceof SizeRankingView) view.refresh();
    }
  }

  async recalculate(): Promise<void> {
    if (this.rebuildPromise) return this.rebuildPromise;
    this.rebuildPromise = this.rebuild()
      .then(() => {
        this.refreshUi();
        new Notice("File and folder sizes recalculated.");
      })
      .catch((error: unknown) => {
        console.error("File Explorer Size: rebuild failed", error);
        new Notice("Failed to recalculate file sizes.");
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
    this.decorator = new FileExplorerDecorator({
      roots: explorerRoots,
      sizeFor: (path, folder) =>
        folder ? this.index.getFolderSize(path) : this.index.getFileSize(path),
      format: (size) => formatBytes(size, this.settings.unit),
      fileWarningBytes: () => this.settings.fileWarningBytes,
      folderWarningBytes: () => this.settings.folderWarningBytes,
      shown: () => this.settings.showSizes,
      onToggle: (shown) => void this.setSizesShown(shown)
    });
    this.decorator.start();
    this.installToolbarActions();

    this.updater = new IncrementalUpdater(
      this.createEventSource(),
      this.index,
      () => this.refreshUi(),
      () => void this.recalculate()
    );
    this.updater.start();

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.decorator?.start();
        this.installToolbarActions();
      })
    );
  }

  private async rebuild(): Promise<void> {
    this.index.rebuild(
      this.app.vault.getFiles().map((file) => ({
        path: file.path,
        size: file.stat.size
      }))
    );
  }

  private async setSizesShown(shown: boolean): Promise<void> {
    this.settings.showSizes = shown;
    await this.saveSettings();
    this.decorator?.refresh();
  }

  private installToolbarActions(): void {
    this.removeToolbarActions?.();
    this.removeToolbarActions = installToggleActions(() => this.decorator?.toggle());
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
