import eslint from "@eslint/js";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["main.js", "node_modules/**", "coverage/**", "eslint.config.mjs", "esbuild.config.mjs"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.json"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off"
    }
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "@microsoft/sdl/no-inner-html": "off",
      "no-unsanitized/property": "off",
      "obsidianmd/prefer-active-doc": "off",
      "obsidianmd/prefer-window-timers": "off",
      "obsidianmd/no-global-this": "off"
    }
  },
  {
    files: ["**/*.{json,mjs,js,cjs}"],
    rules: {
      "obsidianmd/no-plugin-as-component": "off",
      "obsidianmd/no-view-references-in-plugin": "off",
      "obsidianmd/no-unsupported-api": "off",
      "obsidianmd/prefer-file-manager-trash-file": "off",
      "obsidianmd/prefer-instanceof": "off"
    }
  },
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
);
