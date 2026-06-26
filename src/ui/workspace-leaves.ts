export interface FileExplorerLeafLike {
  view?: {
    getViewType?: () => string;
    containerEl?: { dataset?: { type?: string } };
  };
}

export interface FileExplorerWorkspaceLike<Leaf extends FileExplorerLeafLike> {
  getLeavesOfType(viewType: string): Leaf[];
  iterateAllLeaves?: (callback: (leaf: Leaf) => void) => void;
}

export function isNativeFileExplorerLeaf(leaf: FileExplorerLeafLike): boolean {
  return (
    leaf.view?.getViewType?.() === "file-explorer" &&
    leaf.view.containerEl?.dataset?.type === "file-explorer"
  );
}

export function findNativeFileExplorerLeaf<Leaf extends FileExplorerLeafLike>(
  workspace: FileExplorerWorkspaceLike<Leaf>
): Leaf | undefined {
  const allLeaves: Leaf[] = [];
  workspace.iterateAllLeaves?.((leaf) => allLeaves.push(leaf));
  const fromAllLeaves = allLeaves.find(isNativeFileExplorerLeaf);
  if (fromAllLeaves) return fromAllLeaves;
  return workspace.getLeavesOfType("file-explorer").find(isNativeFileExplorerLeaf);
}
