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

