(function(global) {
  const PDF_VIEWER_STYLE_ID = 'lightbox-pdf-viewer-styles';
  const PDF_WORKER_SRC = '_js/pdf.worker.min.js';
  const PDF_VIEWER_CSS = "\n    .pdf-viewer-host, .pdf-viewer-host * { margin: 0; padding: 0; box-sizing: border-box; }\n    .pdf-viewer-host { width: 100%; height: 100%; overflow: hidden; background: #222; }\n    .pdf-viewer-host { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; }\n    .pdf-viewer { width: 100%; height: 100%; display: flex; flex-direction: column; background: #222; }\n    .pdf-toolbar { background: #333; padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }\n    .pdf-toolbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }\n    .pdf-toolbar-title { color: #fff; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; max-width: 300px; }\n    .pdf-toolbar-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }\n    .pdf-toolbar-group { display: flex; align-items: center; gap: 2px; padding: 0 8px; border-right: 1px solid #555; }\n    .pdf-toolbar-group:last-child { border-right: none; }\n    .pdf-toolbar-btn {\n      background: #4a4a4a;\n      border: none;\n      color: #fff;\n      width: 32px;\n      height: 32px;\n      border-radius: 4px;\n      cursor: pointer;\n      font-size: 16px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-family:Segoe UI Symbol, Arial, sans-serif;\n    }\n    .pdf-toolbar-btn:hover { background: #5a5a5a; }\n    .pdf-toolbar-btn:disabled { opacity: 0.4; cursor: not-allowed; }\n    .pdf-toolbar-btn.active { background: #4CAF50; }\n    .pdf-toolbar-btn.primary { background: #ff4757; }\n    .pdf-toolbar-btn.primary:hover { background: #ff6b7a; }\n    .pdf-zoom-select { background: #4a4a4a; border: none; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; height: 32px; }\n    .pdf-page-input { background: #4a4a4a; border: none; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; width: 60px; text-align: center; height: 32px; }\n    .pdf-page-info { color: #ccc; font-size: 12px; margin: 0 4px; }\n    .pdf-color-dropdown { position: relative; display: flex; align-items: center; }\n    .pdf-color-dropdown.open .pdf-color-toggle { background: #5a5a5a; }\n    .pdf-color-toggle {\n      width: 32px;\n      height: 32px;\n      border-radius: 4px;\n      border: none;\n      background: #4a4a4a;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      cursor: pointer;\n      padding: 4px;\n      --pdf-color: #ff2b1d;\n    }\n    .pdf-color-toggle::before {\n      content: '';\n      width: 18px;\n      height: 18px;\n      border-radius: 3px;\n      background: var(--pdf-color, #ff2b1d);\n      border: 1px solid #333;\n    }\n    .pdf-color-panel {\n      position: absolute;\n      top: 38px;\n      right: 0;\n      background: #2b2b2b;\n      border: 1px solid #444;\n      border-radius: 6px;\n      padding: 8px;\n      display: none;\n      z-index: 1000;\n      min-width: 150px;\n      box-shadow: 0 8px 16px rgba(0,0,0,0.35);\n    }\n    .pdf-color-dropdown.open .pdf-color-panel { display: block; }\n    .pdf-color-panel input[type=\"color\"] {\n      width: 100%;\n      height: 28px;\n      border: none;\n      padding: 0;\n      background: transparent;\n      cursor: pointer;\n      margin-bottom: 6px;\n    }\n    .pdf-color-panel input[type=\"color\"].hidden { display: none; }\n    .pdf-color-wheel { position: relative; width: 120px; height: 120px; margin: 4px auto 0; }\n    .pdf-color-wheel svg { display: block; }\n    .pdf-color-wheel .pdf-color-wheel-slice { cursor: pointer; }\n    .pdf-color-wheel .pdf-color-wheel-slice:hover { opacity: 0.9; }\n    .pdf-color-wheel { --pdf-color: #ff2b1d; }\n    .pdf-color-wheel .wheel-gap { fill: #2b2b2b; }\n    .pdf-color-wheel .wheel-center { fill: var(--pdf-color, #f7f7f7); stroke: #666; stroke-width: 1; }\n    .pdf-color-swatch {\n      width: 18px;\n      height: 18px;\n      border-radius: 50%;\n      border: 1px solid #666;\n      background: transparent;\n      padding: 0;\n      cursor: pointer;\n    }\n    .pdf-color-swatch.active { box-shadow: 0 0 0 2px #fff; }\n    .pdf-color-swatch:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }\n    .pdf-viewer-content { flex: 1; overflow: auto; padding: 26px 16px 0; display: flex; flex-direction: column; align-items: center; background: #222; }\n    .pdf-canvas-container { position: relative; display: inline-block; box-shadow: 0 4px 20px rgba(0,0,0,0.5); margin-bottom: 32px; min-height: 200px; visibility: hidden; }\n    .pdf-canvas-container.visible { visibility: visible; }\n      #pdf-canvas { display: block; background: #fff; }\n      #pdf-signature-canvas { position: absolute; top: 0; left: 0; pointer-events: none; }\n    .pdf-page-loading {\n      position: absolute;\n      top: 50%;\n      left: 50%;\n      transform: translate(-50%, -50%);\n      color: #888;\n      font-size: 14px;\n    }\n    .pdf-page-loading.hidden { display: none; }\n    .pdf-print-loading {\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background: rgba(0,0,0,0.8);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      flex-direction: column;\n      z-index: 9999;\n    }\n    .pdf-print-loading.hidden { display: none; }\n    .pdf-print-spinner {\n      width: 48px;\n      height: 48px;\n      border: 4px solid #555;\n      border-top-color: #fff;\n      border-radius: 50%;\n      animation: spin 1s linear infinite;\n    }\n    .pdf-print-loading-text {\n      color: #fff;\n      margin-top: 16px;\n      font-size: 16px;\n    }\n    @keyframes spin {\n      to { transform: rotate(360deg); }\n    }\n  ";
  const PDF_VIEWER_MARKUP = "\n  \n  <div class=\"pdf-print-loading hidden\" id=\"pdf-printLoading\">\n    <div class=\"pdf-print-spinner\"></div>\n    <div class=\"pdf-print-loading-text\">正在準備列印...</div>\n  </div>\n  \n  <div class=\"pdf-viewer\" id=\"pdf-viewer\">\n    <div class=\"pdf-toolbar\">\n      <div class=\"pdf-toolbar-left\">\n        <span class=\"pdf-toolbar-title\" id=\"pdf-viewerTitle\"></span>\n      </div>\n      <div class=\"pdf-toolbar-right\">\n        <div class=\"pdf-toolbar-group\">\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-firstBtn\" title=\"第一頁\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M11 17l-5-5 5-5M18 17l-5-5 5-5\"/></svg>\n          </button>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-prevBtn\" title=\"上一頁\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M15 18l-6-6 6-6\"/></svg>\n          </button>\n          <input type=\"number\" class=\"pdf-page-input\" id=\"pdf-pageInput\" min=\"1\" value=\"1\">\n          <span class=\"pdf-page-info\">/ <span id=\"pdf-totalPages\">0</span></span>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-nextBtn\" title=\"下一頁\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 18l6-6-6-6\"/></svg>\n          </button>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-lastBtn\" title=\"末頁\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M13 17l5-5-5-5M6 17l5-5-5-5\"/></svg>\n          </button>\n        </div>\n        <div class=\"pdf-toolbar-group\">\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-zoomOutBtn\" title=\"縮小\">-</button>\n          <select class=\"pdf-zoom-select\" id=\"pdf-zoomSelect\">\n            <option value=\"0.5\">50%</option>\n            <option value=\"0.75\">75%</option>\n            <option value=\"1\">100%</option>\n            <option value=\"1.25\">125%</option>\n            <option value=\"1.5\" selected>150%</option>\n            <option value=\"2\">200%</option>\n            <option value=\"2.5\">250%</option>\n            <option value=\"3\">300%</option>\n            <option value=\"fitWidth\">頁寬</option>\n            <option value=\"fitPage\">整頁</option>\n          </select>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-zoomInBtn\" title=\"放大\">+</button>\n        </div>\n        <div class=\"pdf-toolbar-group\">\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-rotateLeftBtn\" title=\"左旋\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/></svg>\n          </button>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-rotateRightBtn\" title=\"右旋\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 16\"/><path d=\"M21 3v5h-5\"/></svg>\n          </button>\n        </div>\n        <div class=\"pdf-toolbar-group\">\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-signatureBtn\" title=\"Pen\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"/></svg>\n          </button>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-rectBtn\" title=\"Rectangle\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"1\" ry=\"1\"/></svg>\n          </button>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-ellipseBtn\" title=\"Ellipse\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><ellipse cx=\"12\" cy=\"12\" rx=\"7\" ry=\"5\"/></svg>\n          </button>\n          <div class=\"pdf-color-dropdown\" id=\"pdf-colorDropdown\">\n            <button type=\"button\" class=\"pdf-color-toggle\" id=\"pdf-colorToggle\" title=\"Color\" aria-label=\"Color\"></button>\n            <div class=\"pdf-color-panel\" id=\"pdf-colorPanel\">\n              <input type=\"color\" id=\"pdf-sigColor\" value=\"#ff2b1d\" title=\"Color\" class=\"hidden\">\n              <div class=\"pdf-color-panel-title\"></div>\n              <div class=\"pdf-color-wheel\" id=\"pdf-colorWheel\" role=\"img\" aria-label=\"Color wheel\">\n                <svg viewBox=\"0 0 200 200\" width=\"120\" height=\"120\">\n                  <g transform=\"translate(100 100)\">\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L0 -90 A90 90 0 0 1 45 -77.94 Z\" fill=\"#ff2b1d\" data-color=\"#ff2b1d\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L45 -77.94 A90 90 0 0 1 77.94 -45 Z\" fill=\"#ff6a00\" data-color=\"#ff6a00\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L77.94 -45 A90 90 0 0 1 90 0 Z\" fill=\"#ffb400\" data-color=\"#ffb400\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L90 0 A90 90 0 0 1 77.94 45 Z\" fill=\"#ffe600\" data-color=\"#ffe600\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L77.94 45 A90 90 0 0 1 45 77.94 Z\" fill=\"#c8ea1b\" data-color=\"#c8ea1b\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L45 77.94 A90 90 0 0 1 0 90 Z\" fill=\"#6cc339\" data-color=\"#6cc339\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L0 90 A90 90 0 0 1 -45 77.94 Z\" fill=\"#28b463\" data-color=\"#28b463\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L-45 77.94 A90 90 0 0 1 -77.94 45 Z\" fill=\"#00b8b0\" data-color=\"#00b8b0\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L-77.94 45 A90 90 0 0 1 -90 0 Z\" fill=\"#1b93e8\" data-color=\"#1b93e8\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L-90 0 A90 90 0 0 1 -77.94 -45 Z\" fill=\"#2968ff\" data-color=\"#2968ff\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L-77.94 -45 A90 90 0 0 1 -45 -77.94 Z\" fill=\"#3b3bff\" data-color=\"#3b3bff\"></path>\n                    <path class=\"pdf-color-wheel-slice\" d=\"M0 0 L-45 -77.94 A90 90 0 0 1 0 -90 Z\" fill=\"#7a1cff\" data-color=\"#7a1cff\"></path>\n                    <circle class=\"wheel-gap\" cx=\"0\" cy=\"0\" r=\"46\"></circle>\n                    <circle class=\"wheel-center\" cx=\"0\" cy=\"0\" r=\"24\"></circle>\n                  </g>\n                </svg>\n              </div>\n            </div>\n          </div>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-clearSigBtn\" title=\"清除簽名\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/></svg>\n          </button>\n        </div>\n        <div class=\"pdf-toolbar-group\">\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-downloadBtn\" title=\"下載\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/></svg>\n          </button>\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-printBtn\" title=\"印表\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 6 2 18 2 18 9\"/><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"/><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"/></svg>\n          </button>\n        </div>\n        <div class=\"pdf-toolbar-group\">\n          <button class=\"pdf-toolbar-btn\" id=\"pdf-fullscreenBtn\" title=\"全螢幕\">\n            <svg id=\"pdf-fullscreenIcon\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n              <path d=\"M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3\"></path>\n            </svg>\n          </button>\n        </div>\n      </div>\n    </div>\n    <div class=\"pdf-viewer-content\" id=\"pdf-viewerContent\">\n      <div class=\"pdf-canvas-container\" id=\"pdf-canvasContainer\">\n        <div class=\"pdf-page-loading\" id=\"pdf-pageLoading\">載入中...</div>\n        <canvas id=\"pdf-canvas\"></canvas>\n        <canvas id=\"pdf-signature-canvas\"></canvas>\n      </div>\n    </div>\n  </div>";

  function injectPdfViewerStyles() {
    if (document.getElementById(PDF_VIEWER_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PDF_VIEWER_STYLE_ID;
    style.textContent = PDF_VIEWER_CSS;
    document.head.appendChild(style);
  }

  function configurePdfWorker() {
    if (global.pdfjsLib && global.pdfjsLib.GlobalWorkerOptions) {
      global.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
    }
  }

  configurePdfWorker();


class LightboxPdfViewer {
      constructor(options = {}) {
        configurePdfWorker();
        this.options = options;
        this.rootContainer = options.container || document.body;
        this.host = this.createHost();
        this.cleanupHandlers = [];
        this.currentPdf = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.currentScale = 1.5;
        this.currentRotation = 0;
        this.currentPdfPath = '';
          this.currentPdfBytes = null;
          this.renderRequestId = 0;
          this.renderTask = null;
          this.isSignatureMode = false;
        this.currentDrawMode = 'pen';
        this.signatures = {};
        this.viewer = this.getById('pdf-viewer');
        this.viewerTitle = this.getById('pdf-viewerTitle');
        this.pdfCanvas = this.getById('pdf-canvas');
        this.signatureCanvas = this.getById('pdf-signature-canvas');
        this.ctx = this.pdfCanvas.getContext('2d');
        this.ctxSig = this.signatureCanvas.getContext('2d');
        this.viewerContent = this.getById('pdf-viewerContent');
        this.canvasContainer = this.getById('pdf-canvasContainer');
        this.pageLoading = this.getById('pdf-pageLoading');
        this.initElements();
          this.bindEvents();
          this.setupSignatureDrawing();
          this.setSignatureMode(false);
          if (this.options.file) {
          this.open({ name: this.options.name || this.options.file, path: this.options.file });
        } else {
          this.loadPdfFromUrl();
        }
        this.updateColorSwatches();
        }
        createHost() {
        injectPdfViewerStyles();
        const host = document.createElement('div');
        host.className = 'pdf-viewer-host';
        host.innerHTML = PDF_VIEWER_MARKUP;
        this.rootContainer.innerHTML = '';
        this.rootContainer.appendChild(host);
        return host;
      }
      getById(id) {
        return this.host.querySelector('#' + id);
      }
      addListener(target, type, handler, options) {
        target.addEventListener(type, handler, options);
        this.cleanupHandlers.push(function() {
          target.removeEventListener(type, handler, options);
        });
      }
      destroy() {
        this.renderRequestId++;
        if (this.renderTask && typeof this.renderTask.cancel === 'function') {
          try {
            this.renderTask.cancel();
          } catch (err) {
          }
        }
        this.cleanupHandlers.forEach(function(cleanup) { cleanup(); });
        this.cleanupHandlers = [];
        if (this.host && this.host.parentNode) {
          this.host.parentNode.removeChild(this.host);
        }
      }
      initElements() {
          this.prevBtn = this.getById('pdf-prevBtn');
        this.nextBtn = this.getById('pdf-nextBtn');
        this.firstBtn = this.getById('pdf-firstBtn');
        this.lastBtn = this.getById('pdf-lastBtn');
        this.pageInput = this.getById('pdf-pageInput');
        this.totalPagesEl = this.getById('pdf-totalPages');
        this.zoomSelect = this.getById('pdf-zoomSelect');
        this.zoomInBtn = this.getById('pdf-zoomInBtn');
        this.zoomOutBtn = this.getById('pdf-zoomOutBtn');
        this.rotateLeftBtn = this.getById('pdf-rotateLeftBtn');
        this.rotateRightBtn = this.getById('pdf-rotateRightBtn');
        this.signatureBtn = this.getById('pdf-signatureBtn');
        this.rectBtn = this.getById('pdf-rectBtn');
        this.ellipseBtn = this.getById('pdf-ellipseBtn');
        this.clearSigBtn = this.getById('pdf-clearSigBtn');
        this.sigColor = this.getById('pdf-sigColor');
        this.colorDropdown = this.getById('pdf-colorDropdown');
        this.colorToggle = this.getById('pdf-colorToggle');
        this.colorPanel = this.getById('pdf-colorPanel');
        this.colorWheel = this.getById('pdf-colorWheel');
        this.downloadBtn = this.getById('pdf-downloadBtn');
        this.printBtn = this.getById('pdf-printBtn');
        this.fullscreenBtn = this.getById('pdf-fullscreenBtn');
      }
      loadPdfFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const pdfPath = urlParams.get('file');
        const pdfName = urlParams.get('name') || pdfPath;
        if (pdfPath) {
          this.open({ name: pdfName, path: pdfPath });
        }
      }
      async open(pdf) {
        const fileName = pdf.name.split('/').pop().split('?')[0];
        this.viewerTitle.textContent = fileName;
        this.currentPdfPath = pdf.path;
        this.viewer.classList.add('active');
        this.signatures = {};
        this.pageLoading.classList.remove('hidden');
        this.pageLoading.textContent = '正在載入 PDF...';
        let passwordCancelled = false;
        try {
          const response = await fetch(pdf.path);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }
          
          this.currentPdfBytes = await response.arrayBuffer();
          if (this.currentPdfBytes.byteLength === 0) {
            throw new Error('PDF 檔案為空');
          }
          const headerBytes = new Uint8Array(this.currentPdfBytes.slice(0, 8));
          const header = String.fromCharCode.apply(null, headerBytes);
          
          if (!header.startsWith('%PDF-')) {
            throw new Error('檔案不是有效的 PDF 格式（缺少 %PDF- 標頭）');
          }
          const loadingTask = pdfjsLib.getDocument({ 
              data: this.currentPdfBytes.slice(0),
            isEvalSupported: false,
            disableAutoFetch: true,
            disableStreaming: true
          });
            loadingTask.onPassword = function(updateCallback, reason) {
              var hint = reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD
                ? '密碼錯誤，請重新輸入：'
                : '此 PDF 已加密，請輸入密碼：';
              var password = prompt(hint);
              if (password === null) {
                passwordCancelled = true;
                loadingTask.destroy();
                return;
              }
              updateCallback(password);
            };
          
          this.currentPdf = await loadingTask.promise;
          
          this.totalPages = this.currentPdf.numPages;
          
          if (this.totalPages === 0) {
            throw new Error('PDF 沒有任何頁面');
          }
          
          this.totalPagesEl.textContent = this.totalPages;
          this.currentPage = 1;
          this.currentScale = 1.5;
          this.currentRotation = 0;
          this.zoomSelect.value = '1.5';
          this.renderPage(this.currentPage, 'top');
        } catch (err) {
          this.pageLoading.classList.remove('hidden');
          this.pageLoading.style.color = '#ff6b6b';
            let errorMessage = '無法載入 PDF';
            const errName = err && err.name ? err.name : '';
            const errMessage = err && err.message ? err.message : '';
            
            if (passwordCancelled) {
              errorMessage = '已取消密碼輸入';
            } else if (errName === 'InvalidPDFException') {
              errorMessage = 'PDF 格式無效或已損壞';
            } else if (errName === 'PasswordException') {
              errorMessage = 'PDF 需要密碼或密碼錯誤';
            } else if (errName === 'MissingPDFException') {
              errorMessage = 'PDF 檔案遺失或路徑錯誤';
            } else if (errName === 'UnexpectedResponseException') {
              errorMessage = '伺服器回應異常';
            } else if (errMessage.includes('HTTP')) {
              errorMessage = `載入失敗: ${errMessage}`;
            } else if (errMessage.includes('NetworkError') || errMessage.includes('fetch')) {
              errorMessage = '網路連線錯誤，請檢查檔案路徑';
            } else if (errMessage) {
              errorMessage = `載入失敗: ${errMessage}`;
            }
          
          this.pageLoading.textContent = errorMessage;
          
            if (window.parent !== window) {
              window.parent.postMessage({ type: 'pdf-error', message: errorMessage, originalError: errMessage }, '*');
            }
        }
      }
        async renderPage(pageNum, scrollPosition) {
          scrollPosition = scrollPosition || 'top';
          const renderRequestId = ++this.renderRequestId;
          if (this.renderTask && typeof this.renderTask.cancel === 'function') {
            try {
              this.renderTask.cancel();
            } catch (err) {
            }
            this.renderTask = null;
          }
          this.pageLoading.classList.remove('hidden');
          this.pageLoading.style.color = '#888';
          this.pageLoading.textContent = '載入中...';
          try {
            const page = await this.currentPdf.getPage(pageNum);
            if (renderRequestId !== this.renderRequestId) return;
            let viewport = page.getViewport({ scale: this.currentScale, rotation: this.currentRotation });
            const zoomValue = this.zoomSelect.value;
            if (zoomValue === 'fitWidth' || zoomValue === 'fitPage') {
              const containerWidth = this.viewerContent.clientWidth - 32;
              const containerHeight = this.viewerContent.clientHeight + 300;
              let fitScale;
              if (zoomValue === 'fitWidth') {
                fitScale = (containerWidth / viewport.width) * 1.2;
              } else if (zoomValue === 'fitPage') {
                const scaleX = containerWidth / viewport.width;
                const scaleY = containerHeight / viewport.height;
                fitScale = Math.min(scaleX, scaleY);
              } else {
                fitScale = Math.min(containerWidth / viewport.width, containerHeight / viewport.height);
              }
              viewport = page.getViewport({ scale: fitScale, rotation: this.currentRotation });
            }
            this.currentViewport = viewport;
            this.pdfCanvas.height = viewport.height;
            this.pdfCanvas.width = viewport.width;
            this.signatureCanvas.height = viewport.height;
            this.signatureCanvas.width = viewport.width;
            this.renderTask = page.render({ canvasContext: this.ctx, viewport: viewport });
            await this.renderTask.promise;
            if (renderRequestId !== this.renderRequestId) return;
            this.renderTask = null;
            this.pageLoading.classList.add('hidden');
            this.canvasContainer.classList.add('visible');
            this.renderSignatures(pageNum, viewport);
            this.pageInput.value = pageNum;
            this.pageInput.max = this.totalPages;
            this.updateControls();
            const self = this;
            setTimeout(function() {
              if (renderRequestId !== self.renderRequestId) return;
              if (scrollPosition === 'bottom') {
                self.viewerContent.scrollTop = self.viewerContent.scrollHeight;
              } else if (scrollPosition === 'top') {
                self.viewerContent.scrollTop = 0;
              }
            }, 100);
          } catch (err) {
            if (err && err.name === 'RenderingCancelledException') return;
            if (renderRequestId !== this.renderRequestId) return;
            this.pageLoading.classList.remove('hidden');
            this.pageLoading.style.color = '#ff6b6b';
            this.pageLoading.textContent = '頁面載入失敗';
          }
        }
      renderSignatures(pageNum, viewport, previewShape) {
        this.ctxSig.clearRect(0, 0, this.signatureCanvas.width, this.signatureCanvas.height);
        const list = [];
        if (this.signatures[pageNum]) {
          list.push(...this.signatures[pageNum]);
        }
        if (previewShape) {
          list.push(previewShape);
        }
        list.forEach((shape) => {
          if (shape.type === 'rect' || shape.type === 'ellipse') {
            this.drawShapeOnCanvas(shape, viewport, this.ctxSig);
          } else if (shape.points && shape.points.length > 0) {
            this.ctxSig.strokeStyle = shape.color || '#000';
            const lineWidth = (shape.width || 2) * viewport.scale;
            this.ctxSig.lineWidth = lineWidth;
            this.ctxSig.lineCap = 'round';
            this.ctxSig.lineJoin = 'round';
            this.ctxSig.beginPath();
            const start = viewport.convertToViewportPoint(shape.points[0].x, shape.points[0].y);
            this.ctxSig.moveTo(start[0], start[1]);
            for (let i = 1; i < shape.points.length; i++) {
              const pt = viewport.convertToViewportPoint(shape.points[i].x, shape.points[i].y);
              this.ctxSig.lineTo(pt[0], pt[1]);
            }
            this.ctxSig.stroke();
          }
        });
      }
      drawShapeOnCanvas(shape, viewport, ctx) {
        if (!shape || !shape.start || !shape.end) return;
        const start = viewport.convertToViewportPoint(shape.start.x, shape.start.y);
        const end = viewport.convertToViewportPoint(shape.end.x, shape.end.y);
        const x = Math.min(start[0], end[0]);
        const y = Math.min(start[1], end[1]);
        const w = Math.abs(end[0] - start[0]);
        const h = Math.abs(end[1] - start[1]);
        ctx.strokeStyle = shape.color || '#000';
        const lineWidth = (shape.width || 2) * viewport.scale;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        if (shape.type === 'rect') {
          ctx.rect(x, y, w, h);
        } else {
          const cx = x + w / 2;
          const cy = y + h / 2;
          const rx = w / 2;
          const ry = h / 2;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        }
        ctx.stroke();
      }
      setupSignatureDrawing() {
        let isDrawing = false;
        let currentPath = [];
        let currentShape = null;
        const getPos = (e) => {
          const rect = this.signatureCanvas.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          return { x: clientX - rect.left, y: clientY - rect.top };
        };
        const toPdfPoint = (pos) => {
          if (!this.currentViewport || !this.currentViewport.convertToPdfPoint) return null;
          const pdfPoint = this.currentViewport.convertToPdfPoint(pos.x, pos.y);
          return { x: pdfPoint[0], y: pdfPoint[1] };
        };
        const renderCurrentShape = (shape) => {
          if (!shape) return;
          this.renderSignatures(this.currentPage, this.currentViewport, shape);
        };
        const startDrawing = (e) => {
          if (!this.isSignatureMode) return;
          e.preventDefault();
          isDrawing = true;
          const pos = getPos(e);
          const pdfPos = toPdfPoint(pos);
          if (!pdfPos) return;
          if (this.currentDrawMode === 'rect' || this.currentDrawMode === 'ellipse') {
            currentShape = {
              type: this.currentDrawMode,
              start: pdfPos,
              end: pdfPos,
              color: this.sigColor.value,
              width: this.currentViewport ? (2 / this.currentViewport.scale) : 2
            };
          } else {
            currentPath = [pdfPos];
          }
        };
        const draw = (e) => {
          if (!isDrawing || !this.isSignatureMode) return;
          e.preventDefault();
          const pos = getPos(e);
          const pdfPos = toPdfPoint(pos);
          if (!pdfPos) return;
          if (this.currentDrawMode === 'rect' || this.currentDrawMode === 'ellipse') {
            currentShape.end = pdfPos;
            renderCurrentShape(currentShape);
          } else {
            currentPath.push(pdfPos);
            this.ctxSig.strokeStyle = this.sigColor.value;
            this.ctxSig.lineWidth = 2;
            this.ctxSig.lineCap = 'round';
            this.ctxSig.lineJoin = 'round';
            if (currentPath.length >= 2) {
              const lastPoint = currentPath[currentPath.length - 2];
              const lastViewportPoint = this.currentViewport.convertToViewportPoint(lastPoint.x, lastPoint.y);
              const currentViewportPoint = this.currentViewport.convertToViewportPoint(pdfPos.x, pdfPos.y);
              this.ctxSig.beginPath();
              this.ctxSig.moveTo(lastViewportPoint[0], lastViewportPoint[1]);
              this.ctxSig.lineTo(currentViewportPoint[0], currentViewportPoint[1]);
              this.ctxSig.stroke();
            }
          }
        };
        const stopDrawing = () => {
          if (!isDrawing) return;
          isDrawing = false;
          if (this.currentDrawMode === 'rect' || this.currentDrawMode === 'ellipse') {
            if (currentShape) {
              if (!this.signatures[this.currentPage]) {
                this.signatures[this.currentPage] = [];
              }
              this.signatures[this.currentPage].push(currentShape);
            }
            currentShape = null;
          } else {
            if (currentPath.length > 0) {
              if (!this.signatures[this.currentPage]) {
                this.signatures[this.currentPage] = [];
              }
              const width = this.currentViewport ? (2 / this.currentViewport.scale) : 2;
              this.signatures[this.currentPage].push({ points: currentPath.slice(), color: this.sigColor.value, width: width });
            }
          }
          currentPath = [];
        };
        this.signatureCanvas.onmousedown = startDrawing;
        this.signatureCanvas.onmousemove = draw;
        this.signatureCanvas.onmouseup = stopDrawing;
        this.signatureCanvas.onmouseleave = stopDrawing;
        this.signatureCanvas.ontouchstart = startDrawing;
        this.signatureCanvas.ontouchmove = draw;
        this.signatureCanvas.ontouchend = stopDrawing;
      }
      updateControls() {
        this.firstBtn.disabled = this.currentPage <= 1;
        this.prevBtn.disabled = this.currentPage <= 1;
        this.nextBtn.disabled = this.currentPage >= this.totalPages;
        this.lastBtn.disabled = this.currentPage >= this.totalPages;
      }
      goToPage(pageNum, scrollPosition) {
        scrollPosition = scrollPosition || 'top';
        if (pageNum >= 1 && pageNum <= this.totalPages) {
          this.currentPage = pageNum;
          this.renderPage(this.currentPage, scrollPosition);
        }
      }
      setZoom(value) {
        if (value === 'fitWidth' || value === 'fitPage' || value === 'fit') {
          this.zoomSelect.value = value;
        } else {
          this.currentScale = parseFloat(value);
          this.zoomSelect.value = value;
        }
        this.renderPage(this.currentPage, 'top');
      }
      toggleSignatureMode() {
        this.setSignatureMode(!this.isSignatureMode);
      }
      setSignatureMode(isOn) {
        this.isSignatureMode = isOn;
        this.signatureCanvas.style.pointerEvents = this.isSignatureMode ? 'auto' : 'none';
        this.signatureCanvas.style.cursor = this.isSignatureMode ? 'crosshair' : 'default';
        if (!this.isSignatureMode) {
          this.setDrawMode('pen');
        } else {
          this.setDrawMode(this.currentDrawMode || 'pen');
        }
      }
      setDrawMode(mode) {
        this.currentDrawMode = mode;
        if (this.signatureBtn) this.signatureBtn.classList.toggle('active', mode === 'pen' && this.isSignatureMode);
        if (this.rectBtn) this.rectBtn.classList.toggle('active', mode === 'rect' && this.isSignatureMode);
        if (this.ellipseBtn) this.ellipseBtn.classList.toggle('active', mode === 'ellipse' && this.isSignatureMode);
      }
      updateColorSwatches() {
        if (!this.sigColor) return;
        const value = (this.sigColor.value || '').toLowerCase();
        if (this.colorToggle) {
          this.colorToggle.style.setProperty('--pdf-color', value || '#000000');
        }
        if (this.colorWheel) {
          this.colorWheel.style.setProperty('--pdf-color', value || '#000000');
        }
      }
      clearSignatures() {
        if (this.signatures[this.currentPage]) {
          delete this.signatures[this.currentPage];
          this.ctxSig.clearRect(0, 0, this.signatureCanvas.width, this.signatureCanvas.height);
        }
      }
      // Embed drawn shapes into the PDF and return bytes.
      async embedSignaturesToPdf() {
        const pdfDoc = await PDFLib.PDFDocument.load(this.currentPdfBytes);
        const pages = pdfDoc.getPages();
        for (const [pageNum, paths] of Object.entries(this.signatures)) {
          if (!paths || paths.length === 0) continue;
          const pageIndex = parseInt(pageNum) - 1;
          const page = pages[pageIndex];
          const size = page.getSize();
          const sigCanvas = document.createElement('canvas');
          sigCanvas.width = Math.ceil(size.width);
          sigCanvas.height = Math.ceil(size.height);
          const sigCtx = sigCanvas.getContext('2d');
          paths.forEach((path) => {
            if (path.type === 'rect' || path.type === 'ellipse') {
              this.drawShapeOnPdfCanvas(path, sigCtx, size);
            } else if (path.points && path.points.length > 0) {
              sigCtx.strokeStyle = path.color || '#000';
              sigCtx.lineWidth = path.width || 2;
              sigCtx.lineCap = 'round';
              sigCtx.lineJoin = 'round';
              sigCtx.beginPath();
              const startX = path.points[0].x;
              const startY = size.height - path.points[0].y;
              sigCtx.moveTo(startX, startY);
              for (let i = 1; i < path.points.length; i++) {
                const x = path.points[i].x;
                const y = size.height - path.points[i].y;
                sigCtx.lineTo(x, y);
              }
              sigCtx.stroke();
            }
          });
          const pngImage = await pdfDoc.embedPng(sigCanvas.toDataURL('image/png'));
          page.drawImage(pngImage, { x: 0, y: 0, width: size.width, height: size.height });
        }
        return await pdfDoc.save();
      }
      drawShapeOnPdfCanvas(shape, ctx, size) {
        if (!shape || !shape.start || !shape.end) return;
        const startX = shape.start.x;
        const startY = size.height - shape.start.y;
        const endX = shape.end.x;
        const endY = size.height - shape.end.y;
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const w = Math.abs(endX - startX);
        const h = Math.abs(endY - startY);
        ctx.strokeStyle = shape.color || '#000';
        ctx.lineWidth = shape.width || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        if (shape.type === 'rect') {
          ctx.rect(x, y, w, h);
        } else {
          const cx = x + w / 2;
          const cy = y + h / 2;
          const rx = w / 2;
          const ry = h / 2;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        }
        ctx.stroke();
      }
        async downloadSignedPdf() {
          const loadingEl = this.getById('pdf-printLoading');
          loadingEl.querySelector('.pdf-print-loading-text').textContent = '正在準備下載...';
          loadingEl.classList.remove('hidden');
          let url = null;
          try {
            const pdfBytes = await this.embedSignaturesToPdf();
            await new Promise(resolve => setTimeout(resolve, 500));
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            url = URL.createObjectURL(blob);
            link.href = url;
            link.download = this.viewerTitle.textContent;
            link.click();
            setTimeout(function() {
              URL.revokeObjectURL(url);
            }, 1000);
          } catch (err) {
            if (url) URL.revokeObjectURL(url);
            alert('下載失敗');
          } finally {
            loadingEl.classList.add('hidden');
          }
        }
        async doPrint() {
          const loadingEl = this.getById('pdf-printLoading');
          loadingEl.querySelector('.pdf-print-loading-text').textContent = '正在準備列印...';
          loadingEl.classList.remove('hidden');
          let url = null;
          let iframe = null;
          let fallbackTimer = null;
          try {
            const pdfBytes = await this.embedSignaturesToPdf();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            url = URL.createObjectURL(blob);
            iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            const cleanUp = function() {
              if (iframe && iframe.parentNode) {
                document.body.removeChild(iframe);
              }
              if (url) {
                URL.revokeObjectURL(url);
                url = null;
              }
            };
            fallbackTimer = setTimeout(function() {
              loadingEl.classList.add('hidden');
              cleanUp();
              alert('列印失敗');
            }, 15000);
            iframe.onload = function() {
              clearTimeout(fallbackTimer);
              setTimeout(function() {
                loadingEl.classList.add('hidden');
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
              }, 500);
            };
            iframe.onerror = function() {
              clearTimeout(fallbackTimer);
              loadingEl.classList.add('hidden');
              cleanUp();
              alert('列印失敗');
            };
            setTimeout(cleanUp, 60000);
          } catch (err) {
            if (fallbackTimer) clearTimeout(fallbackTimer);
            if (iframe && iframe.parentNode) {
              document.body.removeChild(iframe);
            }
            if (url) URL.revokeObjectURL(url);
            loadingEl.classList.add('hidden');
            alert('列印失敗');
          }
        }
        close() {
          if (typeof this.options.onClose === 'function') {
            this.options.onClose();
            return;
          }
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'pdf-close' }, '*');
            if (window.parent.jQuery && window.parent.jQuery.fancybox) {
              window.parent.jQuery.fancybox.close();
            }
          } else if (window.jQuery && window.jQuery.fancybox) {
            window.jQuery.fancybox.close();
          }
        }
      bindEvents() {
        const enterFullscreenSVG = '<svg id="pdf-fullscreenIcon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
        const exitFullscreenSVG = '<svg id="pdf-fullscreenIcon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>';
        const scales = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
        const self = this;
        this.firstBtn.addEventListener('click', function() { self.goToPage(1, 'top'); });
        this.prevBtn.addEventListener('click', function() { self.goToPage(self.currentPage - 1, 'top'); });
        this.nextBtn.addEventListener('click', function() { self.goToPage(self.currentPage + 1, 'top'); });
        this.lastBtn.addEventListener('click', function() { self.goToPage(self.totalPages, 'top'); });
        this.pageInput.addEventListener('change', function(e) { self.goToPage(parseInt(e.target.value), 'top'); });
        this.zoomSelect.addEventListener('change', function(e) { self.setZoom(e.target.value); });
        this.zoomInBtn.addEventListener('click', function() {
          const zoomValue = self.zoomSelect.value;
          if (zoomValue === 'fitWidth' || zoomValue === 'fitPage' || zoomValue === 'fit') {
            self.setZoom('1');
          } else {
            const idx = scales.indexOf(self.currentScale);
            if (idx < scales.length - 1) { self.setZoom(scales[idx + 1]); }
          }
        });
        this.zoomOutBtn.addEventListener('click', function() {
          const zoomValue = self.zoomSelect.value;
          if (zoomValue === 'fitWidth' || zoomValue === 'fitPage') {
            self.setZoom('0.5');
          } else {
            const idx = scales.indexOf(self.currentScale);
            if (idx > 0) { self.setZoom(scales[idx - 1]); }
          }
        });
        this.rotateLeftBtn.addEventListener('click', function() { self.currentRotation = (self.currentRotation - 90 + 360) % 360; self.renderPage(self.currentPage, 'keep'); });
        this.rotateRightBtn.addEventListener('click', function() { self.currentRotation = (self.currentRotation + 90) % 360; self.renderPage(self.currentPage, 'keep'); });
        this.signatureBtn.addEventListener('click', function() {
          if (self.isSignatureMode && self.currentDrawMode === 'pen') {
            self.setSignatureMode(false);
          } else {
            self.setSignatureMode(true);
            self.setDrawMode('pen');
          }
        });
        this.rectBtn.addEventListener('click', function() {
          if (self.isSignatureMode && self.currentDrawMode === 'rect') {
            self.setSignatureMode(false);
          } else {
            self.setSignatureMode(true);
            self.setDrawMode('rect');
          }
        });
        this.ellipseBtn.addEventListener('click', function() {
          if (self.isSignatureMode && self.currentDrawMode === 'ellipse') {
            self.setSignatureMode(false);
          } else {
            self.setSignatureMode(true);
            self.setDrawMode('ellipse');
          }
        });
        if (this.colorToggle && this.colorDropdown) {
          this.colorToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            self.colorDropdown.classList.toggle('open');
            if (self.colorDropdown.classList.contains('open') && self.colorPanel) {
              self.colorPanel.focus && self.colorPanel.focus();
            }
          });
        }
        this.addListener(document, 'click', function(e) {
          if (!self.colorDropdown) return;
          if (self.colorDropdown.contains(e.target)) return;
          self.colorDropdown.classList.remove('open');
        });
        if (this.colorPanel) {
          this.colorPanel.addEventListener('click', function(e) { e.stopPropagation(); });
        }
        this.sigColor.addEventListener('input', function() { self.updateColorSwatches(); });
        this.sigColor.addEventListener('change', function() { self.updateColorSwatches(); });
        if (this.colorWheel) {
          this.colorWheel.addEventListener('click', function(e) {
            const target = e.target.closest('.pdf-color-wheel-slice');
            if (!target) return;
            const color = target.getAttribute('data-color');
            if (color) {
              self.sigColor.value = color;
              self.updateColorSwatches();
            }
          });
        }
        this.clearSigBtn.addEventListener('click', function() { self.clearSignatures(); });
        this.downloadBtn.addEventListener('click', function() { self.downloadSignedPdf(); });
        this.printBtn.addEventListener('click', function() { self.doPrint(); });
        this.fullscreenBtn.addEventListener('click', function() {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            self.viewer.requestFullscreen();
          }
        });
        this.addListener(document, 'fullscreenchange', function() {
          if (document.fullscreenElement) {
            self.fullscreenBtn.innerHTML = exitFullscreenSVG;
            self.fullscreenBtn.title = '退出全螢幕';
          } else {
            self.fullscreenBtn.innerHTML = enterFullscreenSVG;
            self.fullscreenBtn.title = '全螢幕';
          }
        });
        this.addListener(document, 'keydown', function(e) {
          if (e.key === 'Escape') {
            if (self.isSignatureMode) { self.toggleSignatureMode(); } else { self.close(); }
          }
          if (!self.isSignatureMode) {
            if (e.key === 'ArrowLeft') self.goToPage(self.currentPage - 1, 'top');
            if (e.key === 'ArrowRight') self.goToPage(self.currentPage + 1, 'top');
            if (e.key === 'Home') self.goToPage(1, 'top');
            if (e.key === 'End') self.goToPage(self.totalPages, 'top');
            if (e.key === '+' || e.key === '=') self.zoomInBtn.click();
            if (e.key === '-') self.zoomOutBtn.click();
          }
        });
        let isScrolling = false;
        this.addListener(this.viewerContent, 'wheel', function(e) {
          if (self.isSignatureMode) return;
          if (isScrolling) return;
          const content = self.viewerContent;
          const scrollTop = content.scrollTop;
          const scrollHeight = content.scrollHeight;
          const clientHeight = content.clientHeight;
          const deltaY = e.deltaY;
          if (deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 10 && self.currentPage < self.totalPages) {
            e.preventDefault();
            isScrolling = true;
            self.goToPage(self.currentPage + 1, 'top');
            setTimeout(function() { isScrolling = false; }, 300);
          } else if (deltaY < 0 && scrollTop <= 10 && self.currentPage > 1) {
            e.preventDefault();
            isScrolling = true;
            self.goToPage(self.currentPage - 1, 'bottom');
            setTimeout(function() { isScrolling = false; }, 300);
          }
        }, { passive: false });
      }
    }


  global.LightboxPdfViewer = LightboxPdfViewer;
  global.PdfViewer = LightboxPdfViewer;
})(window);
