# 项目规则

## 备份规范
- 每次重要修改后，必须备份到 `bak/` 目录
- 档名格式: `index_YYYYMMDD_HHMMSS.html`
- 指令: `cp index.html "bak/index_$(date +%Y%m%d_%H%M%S).html"`

## 代码规范
- 使用 HTML 实体或 SVG 图示，避免 Unicode 编码问题
- 字体: `Segoe UI Symbol, Arial, sans-serif`
- 避免在 JavaScript 中使用模板字串包含 HTML 标签
- 使用 `<\/body>` 避免标签被错误解析

## 維護注意事項
- JavaScript 縮排使用兩格空白。
- 程式碼註解使用英文。
- 避免在 JavaScript 中使用模板字串包含大量 HTML 標籤。
- 修改 viewer 尺寸時，要同時檢查桌面與窄視窗，避免外層按鈕與內層 toolbar 重疊。
- 若改動 `_js/pdf-viewer.js` 的 ID 或 class，需同步檢查 `_js/lightbox.js` 對 `.pdf-viewer-host` 的樣式與測試。

## 开发流程
1. 先备份当前版本
2. 进行修改
3. 测试功能
4. 更新 SPEC.md（如有需要）
