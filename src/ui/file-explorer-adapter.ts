export const FILE_ROW_SELECTOR = ".nav-file-title[data-path]";
export const FOLDER_ROW_SELECTOR = ".nav-folder-title[data-path]";

export function explorerRoots(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(".nav-files-container")];
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
    const leaf = root.closest<HTMLElement>(".workspace-leaf");
    const actions = leaf?.querySelector<HTMLElement>(".view-actions");
    if (!actions || actions.querySelector(".fes-toggle-action")) continue;
    const button = document.createElement("button");
    button.className = "clickable-icon fes-toggle-action";
    button.setAttribute("aria-label", "Toggle file and folder sizes");
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 7h16M4 12h10M4 17h7"/><path fill="none" stroke="currentColor" stroke-width="2" d="M18 11v7m-3-3h6"/></svg>';
    button.addEventListener("click", onClick);
    actions.prepend(button);
    buttons.push(button);
  }
  return () => buttons.forEach((button) => button.remove());
}
