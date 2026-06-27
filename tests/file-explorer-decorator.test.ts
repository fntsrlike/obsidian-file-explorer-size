// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

Object.defineProperty(globalThis, "activeDocument", {
  configurable: true,
  get: () => document
});
import { FileExplorerDecorator } from "../src/ui/file-explorer-decorator";
import {
  explorerRoots,
  installToggleActions
} from "../src/ui/file-explorer-adapter";

function explorerFixture(): HTMLElement {
  const root = document.createElement("div");
  root.className = "nav-files-container";
  root.innerHTML = `
    <div class="nav-folder-title" data-path="large">
      <div class="nav-folder-title-content">large</div>
    </div>
    <div class="nav-file-title" data-path="large/video.mov">
      <div class="nav-file-title-content">video.mov</div>
    </div>
  `;
  document.body.append(root);
  return root;
}

describe("FileExplorerDecorator", () => {
  it("finds MAKE.md roots without installing a toolbar action", () => {
    document.body.innerHTML = `
      <div class="workspace-leaf-content" data-type="mk-path-view">
        <div class="view-actions"><button class="existing-action">Existing</button></div>
        <div class="mk-tree-item nav-folder-title" data-path="/">
          <div class="nav-folder-title-content">Vault</div>
        </div>
      </div>
    `;
    expect(explorerRoots()).toHaveLength(1);
    const remove = installToggleActions(vi.fn());
    expect(
      document.querySelector(
        '.workspace-leaf-content[data-type="mk-path-view"] .fes-toggle-action'
      )
    ).toBeNull();
    remove();
    expect(document.querySelector(".fes-toggle-action")).toBeNull();
    document.body.innerHTML = "";
  });

  it("installs the size toggle only in the native File Browser toolbar", () => {
    document.body.innerHTML = `
      <div class="workspace-leaf-content" data-type="file-explorer">
        <div class="nav-buttons-container">
          <button class="existing-action">Existing</button>
        </div>
      </div>
    `;
    const remove = installToggleActions(vi.fn());
    const toggle = document.querySelector(".fes-toggle-action");
    expect(toggle).not.toBeNull();
    expect(toggle?.textContent).toContain("MB");
    expect(toggle?.innerHTML).toContain('d="M2 5h13M2 10h13M2 15h13"');
    expect(toggle?.innerHTML).toContain('x="11"');
    expect(toggle?.parentElement?.lastElementChild).toBe(toggle);
    remove();
    document.body.innerHTML = "";
  });

  it("decorates each row once and applies separate warning thresholds", () => {
    const root = explorerFixture();
    const decorator = new FileExplorerDecorator({
      roots: () => [root],
      sizeFor: (path, folder) =>
        folder ? (path === "large" ? 101 : undefined) : path.endsWith(".mov") ? 11 : undefined,
      format: (size) => `${size} MB`,
      fileWarningBytes: () => 10,
      folderWarningBytes: () => 100,
      shown: () => true,
      onToggle: vi.fn()
    });
    decorator.refresh();
    decorator.refresh();

    const labels = root.querySelectorAll(".fes-size-label");
    expect(labels).toHaveLength(2);
    expect([...labels].every((label) => label.classList.contains("is-warning"))).toBe(true);
    root.remove();
  });

  it("toggles visibility through a root class and cleans up", () => {
    const root = explorerFixture();
    let shown = true;
    const onToggle = vi.fn((next: boolean) => {
      shown = next;
    });
    const decorator = new FileExplorerDecorator({
      roots: () => [root],
      sizeFor: () => 1,
      format: () => "1 B",
      fileWarningBytes: () => 10,
      folderWarningBytes: () => 100,
      shown: () => shown,
      onToggle
    });
    decorator.start();
    decorator.toggle();
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(root.classList.contains("fes-sizes-hidden")).toBe(true);

    decorator.stop();
    expect(root.querySelector(".fes-size-label")).toBeNull();
    expect(root.classList.contains("fes-sizes-hidden")).toBe(false);
    root.remove();
  });

  it("decorates rows added after start", async () => {
    const root = explorerFixture();
    const decorator = new FileExplorerDecorator({
      roots: () => [root],
      sizeFor: () => 2,
      format: () => "2 B",
      fileWarningBytes: () => 10,
      folderWarningBytes: () => 100,
      shown: () => true,
      onToggle: vi.fn()
    });
    decorator.start();
    const row = document.createElement("div");
    row.className = "nav-file-title";
    row.dataset.path = "new.md";
    row.innerHTML = `<div class="nav-file-title-content">new.md</div>`;
    root.append(row);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(row.querySelector(".fes-size-label")?.textContent).toBe("2 B");
    decorator.stop();
    root.remove();
  });

  it("shows missing sizes as a subdued zero value", () => {
    const root = explorerFixture();
    const decorator = new FileExplorerDecorator({
      roots: () => [root],
      sizeFor: () => undefined,
      format: (size) => (size === 0 ? "0 KB" : `${size} B`),
      fileWarningBytes: () => 10,
      folderWarningBytes: () => 100,
      shown: () => true,
      onToggle: vi.fn()
    });

    decorator.refresh();

    const labels = root.querySelectorAll(".fes-size-label");
    expect(labels).toHaveLength(2);
    expect([...labels].every((label) => label.textContent === "0 KB")).toBe(true);
    expect([...labels].every((label) => label.classList.contains("is-zero"))).toBe(true);
    root.remove();
  });
});
