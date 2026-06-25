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

  upsertFile(path: string, size: number): void {
    const safeSize = Math.max(0, size);
    const previous = this.fileSizes.get(path) ?? 0;
    const delta = safeSize - previous;
    this.fileSizes.set(path, safeSize);
    this.applyDelta(path, delta);
  }

  deleteFile(path: string): boolean {
    const previous = this.fileSizes.get(path);
    if (previous === undefined) return false;
    this.fileSizes.delete(path);
    this.applyDelta(path, -previous);
    return true;
  }

  renamePath(oldPath: string, newPath: string): boolean {
    const matching = [...this.fileSizes]
      .filter(([path]) => path === oldPath || path.startsWith(`${oldPath}/`))
      .map(([path, size]) => ({
        path: path === oldPath ? newPath : `${newPath}${path.slice(oldPath.length)}`,
        size
      }));
    if (matching.length === 0) return false;

    const retained = [...this.fileSizes]
      .filter(([path]) => path !== oldPath && !path.startsWith(`${oldPath}/`))
      .map(([path, size]) => ({ path, size }));
    this.rebuild([...retained, ...matching]);
    return true;
  }

  topFiles(limit: number): SizedPath[] {
    return rankedEntries(this.fileSizes, limit);
  }

  topFolders(limit: number): SizedPath[] {
    const folders = new Map(this.folderSizes);
    folders.delete("");
    return rankedEntries(folders, limit);
  }

  private applyDelta(filePath: string, delta: number): void {
    if (delta === 0) return;
    for (const folder of ancestorFolders(filePath)) {
      const next = (this.folderSizes.get(folder) ?? 0) + delta;
      if (next > 0 || folder === "") {
        this.folderSizes.set(folder, Math.max(0, next));
      } else {
        this.folderSizes.delete(folder);
      }
    }
  }
}
