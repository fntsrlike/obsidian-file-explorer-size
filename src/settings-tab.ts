import { App, PluginSettingTab, Setting } from "obsidian";
import type FileExplorerSizePlugin from "./main";
import type { SizeUnit } from "./domain/format-size";

const MIB = 1024 * 1024;

export class FileExplorerSizeSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: FileExplorerSizePlugin) {
    super(app, plugin);
  }

  display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName("Show sizes")
      .setDesc("Show file and recursive folder sizes in the file explorer.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showSizes).onChange(async (value) => {
          this.plugin.settings.showSizes = value;
          await this.plugin.saveSettings();
          this.plugin.refreshUi();
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
        "Reserved for desktop filesystem support. Obsidian's Vault API normally excludes .obsidian."
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

