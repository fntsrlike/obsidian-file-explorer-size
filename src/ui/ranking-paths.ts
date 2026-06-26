export function displayNameForPath(path: string): string {
  return path.split("/").pop() ?? path;
}
