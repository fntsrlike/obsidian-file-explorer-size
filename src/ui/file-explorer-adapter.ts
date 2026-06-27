import { createFileExplorerSizeToolbarSvg } from "./icons";
export const FILE_ROW_SELECTOR = ".nav-file-title[data-path]";
export const FOLDER_ROW_SELECTOR = ".nav-folder-title[data-path]";

function currentDocument(): Document {
  return activeDocument;
}

function isElementNode(node: ParentNode): node is Element {
  return "nodeType" in node && node.nodeType === Node.ELEMENT_NODE;
}

export function explorerRoots(): HTMLElement[] {
  return [
    ...currentDocument().querySelectorAll<HTMLElement>(
      '.workspace-leaf-content[data-type="file-explorer"], .workspace-leaf-content[data-type="mk-path-view"]'
    )
  ];
}

export function fileBrowserRoots(): HTMLElement[] {
  return [
    ...currentDocument().querySelectorAll<HTMLElement>(
      '.workspace-leaf-content[data-type="file-explorer"]'
    )
  ];
}

export function makeNavigatorRoots(): HTMLElement[] {
  return [
    ...currentDocument().querySelectorAll<HTMLElement>(
      '.workspace-leaf-content[data-type="mk-path-view"]'
    )
  ];
}

export function rowsWithin(root: ParentNode): HTMLElement[] {
  const rows: HTMLElement[] = [];
  if (
    isElementNode(root) &&
    root.matches(`${FILE_ROW_SELECTOR}, ${FOLDER_ROW_SELECTOR}`)
  ) {
    rows.push(root as HTMLElement);
  }
  rows.push(
    ...root.querySelectorAll<HTMLElement>(
      `${FILE_ROW_SELECTOR}, ${FOLDER_ROW_SELECTOR}`
    )
  );
  return rows;
}

export function isFolderRow(row: HTMLElement): boolean {
  return row.matches(FOLDER_ROW_SELECTOR);
}

export function installToggleActions(onClick: () => void): () => void {
  const buttons: HTMLElement[] = [];
  for (const root of fileBrowserRoots()) {
    const actions =
      root.querySelector<HTMLElement>(".nav-buttons-container") ??
      root.querySelector<HTMLElement>(".view-actions") ??
      root
        .closest<HTMLElement>(".workspace-leaf")
        ?.querySelector<HTMLElement>(".view-actions");
    if (!actions || actions.querySelector(".fes-toggle-action")) continue;
    const button = root.ownerDocument.createElement("button");
    button.className = "clickable-icon fes-toggle-action";
    button.setAttribute("aria-label", "顯示／隱藏檔案大小");
    button.append(createFileExplorerSizeToolbarSvg(root.ownerDocument));
    button.addEventListener("click", onClick);
    actions.append(button);
    buttons.push(button);
  }
  return () => buttons.forEach((button) => button.remove());
}
