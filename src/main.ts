import { Plugin } from "obsidian";

export default class FileExplorerSizePlugin extends Plugin {
  async onload(): Promise<void> {
    console.debug("File Explorer Size loaded");
  }
}

