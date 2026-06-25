export const FILE_ROW_SELECTOR = ".nav-file-title[data-path]";
export const FOLDER_ROW_SELECTOR = ".nav-folder-title[data-path]";

export function explorerRoots(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(
      '.workspace-leaf-content[data-type="file-explorer"], .workspace-leaf-content[data-type="mk-path-view"]'
    )
  ];
}

export function rowsWithin(root: ParentNode): HTMLElement[] {
  const rows: HTMLElement[] = [];
  if (
    root instanceof HTMLElement &&
    root.matches(`${FILE_ROW_SELECTOR}, ${FOLDER_ROW_SELECTOR}`)
  ) {
    rows.push(root);
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
  for (const root of explorerRoots()) {
    const actions =
      root.querySelector<HTMLElement>(".nav-buttons-container") ??
      root.querySelector<HTMLElement>(".view-actions") ??
      root.closest<HTMLElement>(".workspace-leaf")?.querySelector<HTMLElement>(".view-actions");
    if (!actions || actions.querySelector(".fes-toggle-action")) continue;
    const button = document.createElement("button");
    button.className = "clickable-icon fes-toggle-action";
    button.setAttribute("aria-label", "顯示／隱藏檔案大小");
    button.innerHTML =
      '<svg viewBox="0 0 28 20" width="24" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M2 5h8M2 10h8M2 15h8"/><text x="13" y="13.5" fill="currentColor" font-size="7" font-family="sans-serif" font-weight="600">MB</text></svg>';
    button.addEventListener("click", onClick);
    actions.append(button);
    buttons.push(button);
  }
  return () => buttons.forEach((button) => button.remove());
}
