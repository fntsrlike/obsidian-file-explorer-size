import { App, PluginSettingTab, Setting } from "obsidian";
import type FileExplorerSizePlugin from "./main";
import type { SizeUnit } from "./domain/format-size";
import type { NoteGroupLinkMode, SizeDisplayMode } from "./settings";
import { shouldShowMakeNavigatorSettings } from "./settings-visibility";

const MIB = 1024 * 1024;

export class FileExplorerSizeSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: FileExplorerSizePlugin) {
    super(app, plugin);
  }

  display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName("Show sizes in file browser")
      .setDesc("Show file and recursive folder sizes in Obsidian's file browser.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showFileBrowserSizes)
          .onChange((value) => this.plugin.setFileBrowserSizesShown(value))
      );

    if (
      shouldShowMakeNavigatorSettings({
        installed: this.plugin.isMakeMdInstalled(),
        enabled: this.plugin.isMakeMdEnabled()
      })
    ) {
      new Setting(this.containerEl)
        .setName("Show sizes in MAKE.md Navigator")
        .setDesc("Control size labels in MAKE.md's Navigator independently.")
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.showMakeNavigatorSizes)
            .onChange((value) =>
              this.plugin.setMakeNavigatorSizesShown(value)
            )
        );
    }

    new Setting(this.containerEl)
      .setName("Size display mode")
      .setDesc("Choose whether notes show physical size or note group size.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("physical", "Physical file size")
          .addOption("note-group", "Note group size")
          .setValue(this.plugin.settings.sizeDisplayMode)
          .onChange(async (value) => {
            this.plugin.settings.sizeDisplayMode = value as SizeDisplayMode;
            await this.plugin.saveSettings();
            this.plugin.refreshUi();
          })
      );

    new Setting(this.containerEl)
      .setName("Note group link mode")
      .setDesc("Choose which direct non-note links count toward note groups.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("embedded-only", "Embedded attachments only")
          .addOption("all-direct-non-note", "All direct non-note file links")
          .setValue(this.plugin.settings.noteGroupLinkMode)
          .onChange(async (value) => {
            this.plugin.settings.noteGroupLinkMode =
              value as NoteGroupLinkMode;
            await this.plugin.saveSettings();
            await this.plugin.recalculate();
          })
      );

    this.addMegabyteSetting(
      "File warning threshold",
      "Files larger than this value use the error color.",
      "fileWarningBytes"
    );
    this.addMegabyteSetting(
      "Folder warning threshold",
      "Folders larger than this value use the error color.",
      "folderWarningBytes"
    );

    new Setting(this.containerEl)
      .setName("Ranking limit")
      .setDesc("Number of entries shown in the ranking view.")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.rankingLimit))
          .onChange(async (value) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return;
            this.plugin.settings.rankingLimit = Math.min(
              500,
              Math.max(1, Math.round(parsed))
            );
            await this.plugin.saveSettings();
            this.plugin.refreshUi();
          })
      );

    new Setting(this.containerEl)
      .setName("Size unit")
      .addDropdown((dropdown) => {
        for (const unit of ["auto", "B", "KB", "MB", "GB"] as SizeUnit[]) {
          dropdown.addOption(unit, unit);
        }
        dropdown
          .setValue(this.plugin.settings.unit)
          .onChange(async (value) => {
            this.plugin.settings.unit = value as SizeUnit;
            await this.plugin.saveSettings();
            this.plugin.refreshUi();
          });
      });

    new Setting(this.containerEl)
      .setName("Include hidden settings content")
      .setDesc(
        "Reserved for desktop filesystem support. Hidden configuration folders are not included by the vault API."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeHidden)
          .setDisabled(true)
      );
  }

  private addMegabyteSetting(
    name: string,
    description: string,
    key: "fileWarningBytes" | "folderWarningBytes"
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(description)
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings[key] / MIB))
          .onChange(async (value) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed) || parsed < 0) return;
            this.plugin.settings[key] = parsed * MIB;
            await this.plugin.saveSettings();
            this.plugin.refreshUi();
          })
      );
  }
}
