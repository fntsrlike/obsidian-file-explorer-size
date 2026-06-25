export function parentPath(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? "" : path.slice(0, slash);
}

export function ancestorFolders(filePath: string): string[] {
  const ancestors: string[] = [];
  let current = parentPath(filePath);
  while (true) {
    ancestors.push(current);
    if (current === "") return ancestors;
    current = parentPath(current);
  }
}

