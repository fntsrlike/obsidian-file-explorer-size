# File Explorer Size

在 Obsidian 檔案瀏覽器顯示檔案大小與遞迴資料夾總大小，並提供最大項目排行側欄。

## 功能

- 每個檔案與資料夾右側顯示大小。
- 可切換「實體檔案大小」或「筆記群組大小」顯示模式。
- 筆記群組大小 = Markdown 筆記本身 + 直接連結的非 Markdown 檔案；`[[另一篇筆記]]` 不會遞迴計入。
- 筆記群組可選「只計算嵌入附件」或「計算所有直接非筆記檔案連結」。
- 資料夾大小包含所有子目錄，且永遠以實體遞迴大小計算，避免重複計入共享附件。
- 檔案超過 10 MB、資料夾超過 100 MB 時預設以紅字顯示。
- 原生 File Browser 工具列可快速切換顯示／隱藏。
- MAKE.md Navigator 使用獨立設定與命令，不在其工具列加入按鈕。
- 獨立排行側欄，可切換實體檔案、筆記群組與實體資料夾前 N 名。
- 建立、修改、刪除與移動檔案時更新；筆記連結 metadata 改變時也會同步更新筆記群組大小。
- 支援原生檔案瀏覽器及 MAKE.md Navigator。

## 命令

- `File Explorer Size: Toggle File Browser sizes`
- `File Explorer Size: Toggle MAKE.md Navigator sizes`（僅 MAKE.md 已啟用時）
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
