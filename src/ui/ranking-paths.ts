export function displayNameForPath(path: string): string {
  return path.split("/").pop() ?? path;
}

export function parentHintForPath(path: string): string {
  const parts = path.split("/");
  if (parts.length <= 1) return "";
  const parent = parts[parts.length - 2];
  return parent ? `… / ${parent}` : "";
}
