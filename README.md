# File Explorer Size

在 Obsidian 檔案瀏覽器顯示檔案大小與遞迴資料夾總大小，並提供最大項目排行側欄。

## 功能

- 每個檔案與資料夾右側顯示大小。
- 資料夾大小包含所有子目錄。
- 檔案超過 10 MB、資料夾超過 100 MB 時預設以紅字顯示。
- 檔案瀏覽器工具列可快速切換顯示／隱藏。
- 獨立排行側欄，可切換檔案與資料夾前 N 名。
- 建立、修改、刪除與移動檔案時增量更新。
- 支援原生檔案瀏覽器及 MAKE.md Navigator。

## 命令

- `File Explorer Size: Toggle size display`
- `File Explorer Size: Open size ranking`
- `File Explorer Size: Recalculate all sizes`

## 開發

```bash
pnpm install
pnpm test
pnpm lint
pnpm build
```

此外掛目錄本身是獨立 Git repository。

## 已知限制

- `.obsidian` 等隱藏設定內容不在 Obsidian Vault API 的一般檔案清單中，因此第一版不納入統計。
- 檔案瀏覽器 DOM 並非正式公開 API；若 Obsidian 或 MAKE.md 大幅改版，可能需要更新 adapter。
