# Lightbox 檔案預覽模組

這個目錄是一個純前端的燈箱預覽模組，可用同一組 Lightbox 介面開啟圖片、PDF、iframe 內容與 3D 模型檔。示範入口是 `index.html`，主要邏輯在 `_js/lightbox.js`，PDF 專用 viewer 在 `_js/pdf-viewer.js`。

## 主要檔案

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 示範頁，載入必要 JS 並綁定 `[data-fancybox]` 元素 |
| `_js/lightbox.js` | Lightbox 主程式，負責分組、開關燈箱、圖片操作、PDF/3D/iframe 分流 |
| `_js/pdf-viewer.js` | PDF.js + pdf-lib viewer，支援翻頁、縮放、旋轉、簽名、圖形標註、下載與列印 |
| `_js/pdf.min.js` | PDF.js 主程式 |
| `_js/pdf.worker.min.js` | PDF.js worker |
| `_js/pdf-lib.min.js` | 將簽名或圖形嵌回 PDF 時使用 |
| `_js/online3DViewer/` | 3D 模型預覽與匯出依賴 |

## 載入順序

PDF inline viewer 需要先載入 PDF 相關依賴，再載入 Lightbox：

```html
<script src="_js/print.min.js"></script>
<script src="_js/online3DViewer/o3dv.min.js"></script>
<script>
  OV.SetExternalLibLocation('_js/online3DViewer/libs/');
</script>
<script src="_js/pdf.min.js"></script>
<script src="_js/pdf-lib.min.js"></script>
<script src="_js/pdf-viewer.js?v=20260708_2"></script>
<script src="_js/lightbox.js?v=20260708_5"></script>
```

修改 `_js/lightbox.js` 或 `_js/pdf-viewer.js` 後，建議同步更新 URL 後面的 `v=` 版本參數，避免瀏覽器載入舊快取。

## 基本用法

HTML 元素只要加上 `data-fancybox` 就會被同一組 Lightbox 分組：

```html
<a href="1.jpg" data-fancybox="gallery">
  <img src="1.jpg" alt="1.jpg">
</a>

<a href="./Report.pdf" data-fancybox="gallery" data-type="pdf">
  <div class="gallery-item pdf">Report.pdf</div>
</a>

<a href="./M3ALLTDG.stl" data-fancybox="gallery">
  <div class="gallery-item pdf">M3ALLTDG.stl</div>
</a>
```

初始化：

```html
<script>
  const fancybox = Lightbox.bind('[data-fancybox]', {
    usePdfjsViewer: true
  });
</script>
```

## 支援格式

| 類型 | 判斷方式 | 功能 |
| --- | --- | --- |
| 圖片 | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif` | 縮放、旋轉、拖曳、下載、列印 |
| PDF | `.pdf` 或 `data-type="pdf"` | inline PDF viewer、翻頁、縮放、旋轉、簽名、圖形標註、下載、列印 |
| 3D 模型 | `.stl`, `.stp`, `.step`, `.igs`, `.iges` | 3D 預覽、下載原檔、匯出多種格式 |
| 其他內容 | 未匹配以上格式 | iframe 預覽 |

若自動判斷不符合需求，可直接指定 `data-type`：

```html
<a href="./file.pdf" data-fancybox="gallery" data-type="pdf">PDF</a>
<a href="./image.jpg" data-fancybox="gallery" data-type="image">Image</a>
```

## PDF viewer 行為

目前一般 PDF 會優先使用 inline viewer，也就是直接在 Lightbox 內建立 `LightboxPdfViewer`，不再透過 iframe 開啟。這樣可避免 iframe 訊息傳遞與關閉同步問題。

PDF viewer 提供：

- 第一頁、上一頁、下一頁、末頁
- 頁碼輸入
- 縮放與頁寬/整頁顯示
- 左右旋轉
- 筆跡簽名
- 矩形與橢圓標註
- 顏色選擇
- 清除目前頁標註
- 下載已嵌入標註的 PDF
- 列印已嵌入標註的 PDF
- PDF viewer 全螢幕

外層 Lightbox 的左右切換、頁數與關閉按鈕會保留在 viewer 外側。inline PDF viewer 的外框尺寸由 `_js/lightbox.js` 控制：

```css
.lb-content > .pdf-viewer-host {
  width: calc(100vw - 160px);
  max-width: 90vw;
  height: 99vh;
  flex: 0 0 auto;
}
```

這段用來保留左右邊界，避免 PDF toolbar 與外層頁數、關閉按鈕重疊。

## iframe fallback

`_js/lightbox.js` 仍保留舊的 iframe fallback 路徑：

```js
pdfViewerUrl: 'pdf-viewer.html'
```

當 `usePdfjsViewer !== false` 但頁面沒有載入 `LightboxPdfViewer`、`pdfjsLib` 或 `PDFLib` 時，Lightbox 會嘗試改用 `pdf-viewer.html?file=...` 開啟 PDF。

注意：目前根目錄沒有啟用中的 `pdf-viewer.html`。如果要使用 iframe fallback，需要先建立 `pdf-viewer.html`。

## 重要選項

| 選項 | 預設值 | 說明 |
| --- | --- | --- |
| `selector` | `[data-fancybox]` | 要綁定的元素 selector |
| `groupAttr` | `data-fancybox` | 用來分組的 attribute |
| `pdfViewerUrl` | `pdf-viewer.html` | iframe fallback 使用的 PDF viewer URL |
| `usePdfjsViewer` | `true` | 是否使用 PDF.js viewer；設為 `false` 時會直接用 iframe 開 PDF URL |

## 動態加入項目

`Lightbox.bind()` 內有 `MutationObserver`，初始化後新增的 `[data-fancybox]` 元素也會自動綁定：

```js
function addImage() {
  const a = document.createElement('a');
  a.href = 'new-image.jpg';
  a.setAttribute('data-fancybox', 'gallery');
  a.setAttribute('data-type', 'image');
  a.innerHTML = '<img src="new-image.jpg" alt="new-image.jpg">';
  document.querySelector('.gallery').appendChild(a);
}
```

## 測試方式

建議用本機靜態伺服器測試，避免 PDF.js 或 canvas 在 `file://` 下遇到瀏覽器限制：

```bash
python3 -m http.server 8000
```

開啟：

```text
http://127.0.0.1:8000/index.html
```

基本檢查項目：

- 圖片可開啟、縮放、旋轉、拖曳、下載與列印
- PDF 可開啟，且 `.lb-content iframe` 數量為 `0`
- PDF toolbar 不與外層頁數或關閉按鈕重疊
- PDF 簽名模式下，第一次按 `Esc` 退出簽名模式，第二次按 `Esc` 關閉 Lightbox
- PDF 方向鍵在 viewer 內翻頁，不切換外層 gallery
- 3D 模型可載入、旋轉、下載原檔與匯出
- 動態新增元素後仍可點擊開啟

## 維護注意事項

- JavaScript 縮排使用兩格空白。
- 程式碼註解使用英文。
- 避免在 JavaScript 中使用模板字串包含大量 HTML 標籤。
- 修改 viewer 尺寸時，要同時檢查桌面與窄視窗，避免外層按鈕與內層 toolbar 重疊。
- 若改動 `_js/pdf-viewer.js` 的 ID 或 class，需同步檢查 `_js/lightbox.js` 對 `.pdf-viewer-host` 的樣式與測試。
