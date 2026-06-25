import type { SizeUnit } from "./domain/format-size";

export interface FileExplorerSizeSettings {
  showFileBrowserSizes: boolean;
  showMakeNavigatorSizes: boolean;
  fileWarningBytes: number;
  folderWarningBytes: number;
  rankingLimit: number;
  unit: SizeUnit;
  includeHidden: boolean;
}

export const DEFAULT_SETTINGS: FileExplorerSizeSettings = {
  showFileBrowserSizes: true,
  showMakeNavigatorSizes: true,
  fileWarningBytes: 10 * 1024 * 1024,
  folderWarningBytes: 100 * 1024 * 1024,
  rankingLimit: 20,
  unit: "auto",
  includeHidden: false
};

const VALID_UNITS = new Set<SizeUnit>(["auto", "B", "KB", "MB", "GB"]);

function nonNegative(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

export function normalizeSettings(
  data: Partial<FileExplorerSizeSettings> | Record<string, unknown>
): FileExplorerSizeSettings {
  const legacyShowSizes =
    typeof (data as Record<string, unknown>).showSizes === "boolean"
      ? ((data as Record<string, unknown>).showSizes as boolean)
      : undefined;
  const unit = VALID_UNITS.has(data.unit as SizeUnit)
    ? (data.unit as SizeUnit)
    : DEFAULT_SETTINGS.unit;
  return {
    showFileBrowserSizes:
      typeof data.showFileBrowserSizes === "boolean"
        ? data.showFileBrowserSizes
        : legacyShowSizes ?? DEFAULT_SETTINGS.showFileBrowserSizes,
    showMakeNavigatorSizes:
      typeof data.showMakeNavigatorSizes === "boolean"
        ? data.showMakeNavigatorSizes
        : legacyShowSizes ?? DEFAULT_SETTINGS.showMakeNavigatorSizes,
    fileWarningBytes: nonNegative(
      data.fileWarningBytes,
      DEFAULT_SETTINGS.fileWarningBytes
    ),
    folderWarningBytes: nonNegative(
      data.folderWarningBytes,
      DEFAULT_SETTINGS.folderWarningBytes
    ),
    rankingLimit: Math.min(
      500,
      Math.max(
        1,
        Math.round(nonNegative(data.rankingLimit, DEFAULT_SETTINGS.rankingLimit))
      )
    ),
    unit,
    includeHidden:
      typeof data.includeHidden === "boolean"
        ? data.includeHidden
        : DEFAULT_SETTINGS.includeHidden
  };
}
