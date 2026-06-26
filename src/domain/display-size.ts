import type { SizeDisplayMode } from "../settings";

export interface ResolveDisplaySizeInput {
  path: string;
  folder: boolean;
  mode: SizeDisplayMode;
  physicalSize: (path: string, folder: boolean) => number | undefined;
  noteGroupSize: (path: string) => number | undefined;
}

function isMarkdownPath(path: string): boolean {
  return path.toLowerCase().endsWith(".md");
}

export function resolveDisplaySize(input: ResolveDisplaySizeInput): number | undefined {
  if (input.folder) return input.physicalSize(input.path, true);
  if (input.mode === "note-group" && isMarkdownPath(input.path)) {
    return input.noteGroupSize(input.path) ?? input.physicalSize(input.path, false);
  }
  return input.physicalSize(input.path, false);
}

