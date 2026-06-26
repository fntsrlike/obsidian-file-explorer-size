export const SIZE_RANKING_ICON_ID = "file-explorer-size-ranking-mb";

const toolbarIconInnerSvg =
  '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M2 5h13M2 10h13M2 15h13"/><text x="11" y="13.5" fill="var(--background-secondary)" stroke="var(--background-secondary)" stroke-width="2.5" paint-order="stroke" font-size="7" font-family="sans-serif" font-weight="600">MB</text><text x="11" y="13.5" fill="currentColor" font-size="7" font-family="sans-serif" font-weight="600">MB</text>';

export const sizeRankingIconSvg =
  '<line x1="6" x2="6" y1="20" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" x2="12" y1="20" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" x2="18" y1="20" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="7.5" y="14" fill="var(--background-secondary)" stroke="var(--background-secondary)" stroke-width="3" paint-order="stroke" font-size="6.5" font-family="sans-serif" font-weight="700">MB</text><text x="7.5" y="14" fill="currentColor" font-size="6.5" font-family="sans-serif" font-weight="700">MB</text>';

export function fileExplorerSizeToolbarSvg(): string {
  return `<svg viewBox="0 0 28 20" width="24" height="18" aria-hidden="true">${toolbarIconInnerSvg}</svg>`;
}
