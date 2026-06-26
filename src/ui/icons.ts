export const SIZE_RANKING_ICON_ID = "file-explorer-size-ranking-mb";

const toolbarIconInnerSvg =
  '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M2 5h13M2 10h13M2 15h13"/><text x="11" y="13.5" fill="var(--background-secondary)" stroke="var(--background-secondary)" stroke-width="2.5" paint-order="stroke" font-size="7" font-family="sans-serif" font-weight="600">MB</text><text x="11" y="13.5" fill="currentColor" font-size="7" font-family="sans-serif" font-weight="600">MB</text>';

export const sizeRankingIconSvg =
  '<line x1="25" x2="25" y1="86" y2="66" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><line x1="50" x2="50" y1="86" y2="46" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><line x1="75" x2="75" y1="86" y2="18" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><text x="26" y="62" fill="var(--background-secondary)" stroke="var(--background-secondary)" stroke-width="10" paint-order="stroke" font-size="28" font-family="sans-serif" font-weight="700">MB</text><text x="26" y="62" fill="currentColor" font-size="28" font-family="sans-serif" font-weight="700">MB</text>';

export function fileExplorerSizeToolbarSvg(): string {
  return `<svg viewBox="0 0 28 20" width="24" height="18" aria-hidden="true">${toolbarIconInnerSvg}</svg>`;
}
