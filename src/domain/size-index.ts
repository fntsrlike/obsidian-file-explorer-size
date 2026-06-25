import { ancestorFolders } from "./paths";

export interface SizedPath {
  path: string;
  size: number;
}

function rankedEntries(entries: Map<string, number>, limit: number): SizedPath[] {
  return [...entries]
    .map(([path, size]) => ({ path, size }))
    .sort((a, b) => b.size - a.size || a.path.localeCompare(b.path))
    .slice(0, Math.max(0, limit));
}

export class SizeIndex {
  private fileSizes = new Map<string, number>();
  private folderSizes = new Map<string, number>();

  rebuild(files: SizedPath[]): void {
    const nextFiles = new Map<string, number>();
    const nextFolders = new Map<string, number>();

    for (const file of files) {
      const size = Math.max(0, file.size);
      nextFiles.set(file.path, size);
      for (const folder of ancestorFolders(file.path)) {
        nextFolders.set(folder, (nextFolders.get(folder) ?? 0) + size);
      }
    }

    this.fileSizes = nextFiles;
    this.folderSizes = nextFolders;
  }

  getFileSize(path: string): number | undefined {
    return this.fileSizes.get(path);
  }

  getFolderSize(path: string): number | undefined {
    return this.folderSizes.get(path);
  }

  topFiles(limit: number): SizedPath[] {
    return rankedEntries(this.fileSizes, limit);
  }

  topFolders(limit: number): SizedPath[] {
    const folders = new Map(this.folderSizes);
    folders.delete("");
    return rankedEntries(folders, limit);
  }
}

