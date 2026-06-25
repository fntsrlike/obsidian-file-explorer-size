export type SizeUnit = "auto" | "B" | "KB" | "MB" | "GB";

const UNITS = ["B", "KB", "MB", "GB"] as const;
const KIB = 1024;

function displayNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatBytes(bytes: number, unit: SizeUnit = "auto"): string {
  const safeBytes = Math.max(0, bytes);
  if (unit !== "auto") {
    const exponent = UNITS.indexOf(unit);
    return `${displayNumber(safeBytes / KIB ** exponent)} ${unit}`;
  }

  if (safeBytes === 0) return "0 KB";
  const exponent = Math.min(
    Math.floor(Math.log(safeBytes) / Math.log(KIB)),
    UNITS.length - 1
  );
  return `${displayNumber(safeBytes / KIB ** exponent)} ${UNITS[exponent]}`;
}

export function isOverThreshold(size: number, threshold: number): boolean {
  return size > threshold;
}
