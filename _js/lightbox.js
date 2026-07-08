class Lightbox {
  constructor(options = {}) {
    this.options = Object.assign({
      selector: '[data-fancybox]',
      groupAttr: 'data-fancybox',
      pdfViewerUrl: 'pdf-viewer.html',
      usePdfjsViewer: true
    }, options);

    this.currentIndex = 0;
    this.currentZoom = 1;
    this.currentRotation = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.pdfErrorHandler = null;
    this.pdfViewer = null;
    this.stlViewer = null;
    this.modelInitTimer = null;
    this.keydownHandler = null;

    this.init();
  }

  init() {
    this.injectStyles();
    this.createElements();
    this.bindEvents();
  }

  injectStyles() {
    const css = `
      .lb-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
      }
      .lb-overlay.active {
        display: block;
      }
      .lb-content {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
        pointer-events: none;
      }
      .lb-content > * {
        pointer-events: auto;
      }
      .lb-content img {
        max-width: 90vw;
        max-height: 85vh;
        object-fit: contain;
        transition: transform 0.3s ease;
      }
      .lb-loading-icon {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lb-loading-icon::before {
        content: '';
        width: 30px;
        height: 30px;
        border: 3px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: lb-spin 1s linear infinite;
      }
      .lb-error {
        color: #fff;
        text-align: center;
        padding: 40px;
      }
      .lb-error-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      .lb-error-text {
        font-size: 16px;
        color: #fff;
      }
      .lb-stl-viewer {
        width: 90vw;
        height: 85vh;
        min-height: 400px;
        pointer-events: auto;
        overflow: hidden;
      }
      .lb-stl-viewer > div {
        width: 100% !important;
        height: 100% !important;
        pointer-events: auto !important;
      }
      .lb-stl-viewer canvas {
        width: 100% !important;
        height: 100% !important;
        display: block !important;
        pointer-events: auto !important;
      }
      .lb-stl-original-download {
        position: absolute;
        top: 5px;
        right: 95px;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        background: rgba(0,0,0,0.5);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .lb-stl-original-download.visible {
        opacity: 1;
      }
      .lb-stl-original-download:hover {
        background: rgba(0,0,0,0.7);
      }
      .lb-stl-original-download svg {
        width: 20px;
        height: 20px;
      }
      .lb-stl-download {
        position: absolute;
        top: 5px;
        right: 50px;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        background: rgba(0,0,0,0.5);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .lb-stl-download.visible {
        opacity: 1;
      }
      .lb-stl-download:hover {
        background: rgba(0,0,0,0.7);
      }
      .lb-stl-download svg {
        width: 20px;
        height: 20px;
      }
      .lb-export-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100001;
      }
      .lb-export-dialog-content {
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        min-width: 300px;
        max-width: 90vw;
      }
      .lb-export-dialog h3 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
      }
      .lb-export-dialog select {
        width: 100%;
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 16px;
      }
      .lb-export-dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .lb-export-dialog button {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .lb-export-dialog .lb-export-cancel {
        background: #fff;
        border: 1px solid #ddd;
        color: #333;
      }
      .lb-export-dialog .lb-export-confirm {
        background: #0d6efd;
        border: none;
        color: #fff;
      }
      .lb-export-dialog .lb-export-confirm:hover {
        background: #0b5ed7;
      }
      .lb-stl-hint {
        font-size: 14px;
        color: #aaa;
        margin-bottom: 24px;
      }
      @keyframes lb-spin {
        to { transform: rotate(360deg); }
      }
      .lb-content img.loaded {
        opacity: 1;
      }
      .lb-content img {
        opacity: 0;
        transition: opacity 0.3s ease;
        position: relative;
      }
      .lb-content iframe {
        width: 90vw;
        height: 99vh;
        border: none;
        background: #fff;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .lb-content iframe.loaded {
        opacity: 1;
      }
      .lb-content > .pdf-viewer-host {
        width: calc(100vw - 160px);
        max-width: 90vw;
        height: 99vh;
        flex: 0 0 auto;
      }
      .lb-counter {
        position: fixed;
        top: 5px;
        left: 5px;
        color: #fff;
        font-size: 14px;
        background: rgba(0,0,0,0.5);
        padding: 8px 12px;
        border-radius: 20px;
      }
      .lb-close {
        position: fixed;
        top: 5px;
        right: 5px;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        background: rgba(0,0,0,0.5);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lb-toolbar {
        position: fixed;
        top: 5px;
        right: 50px;
        display: flex;
        gap: 5px;
      }
      .lb-toolbar button {
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        background: rgba(0,0,0,0.5);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lb-prev, .lb-next {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        padding: 10px;
        user-select: none;
        background: rgba(0,0,0,0.5);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lb-prev { left: 5px; }
      .lb-next { right: 5px; }
      .lb-prev:hover, .lb-next:hover, .lb-close:hover, .lb-toolbar button:hover {
        color: #ccc;
      }
    `;

    if (!document.getElementById('lb-styles')) {
      const style = document.createElement('style');
      style.id = 'lb-styles';
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  createElements() {
    const existingOverlay = document.getElementById('lb-overlay');
    if (existingOverlay) {
      this.overlay = existingOverlay;
      this.cacheElements();
      return;
    }

    const overlayZ = 99999;
    const childZ = 99998;
    const toolbarZ = 100000;

    this.overlay = document.createElement('div');
    this.overlay.id = 'lb-overlay';
    this.overlay.className = 'lb-overlay';
    this.overlay.style.zIndex = overlayZ;
    this.overlay.innerHTML = `
      <span class="lb-counter">1 / 1</span>
      <button class="lb-close">&times;</button>
      <div class="lb-toolbar">
        <button class="lb-download" title="下載" style="padding:8px;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
        <button class="lb-print" title="列印" style="padding:8px;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
        <button class="lb-zoomout" title="縮小">-</button>
        <button class="lb-zoomin" title="放大">+</button>
        <button class="lb-rotateleft" title="向左轉">&#8634;</button>
        <button class="lb-rotateright" title="向右轉">&#8635;</button>
        <button class="lb-fullscreen" title="全螢幕" style="padding:8px;display:none;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg></button>
      </div>
      <button class="lb-prev">&#10094;</button>
      <button class="lb-next">&#10095;</button>
      <div class="lb-content"></div>
    `;
    document.body.appendChild(this.overlay);

    this.overlay.querySelector('.lb-counter').style.zIndex = toolbarZ;
    this.overlay.querySelector('.lb-close').style.zIndex = toolbarZ;
    this.overlay.querySelector('.lb-toolbar').style.zIndex = toolbarZ;
    this.overlay.querySelector('.lb-prev').style.zIndex = toolbarZ;
    this.overlay.querySelector('.lb-next').style.zIndex = toolbarZ;
    this.overlay.querySelector('.lb-content').style.zIndex = childZ;

    this.cacheElements();
  }

  cacheElements() {
    this.counter = this.overlay.querySelector('.lb-counter');
    this.content = this.overlay.querySelector('.lb-content');
    this.toolbar = this.overlay.querySelector('.lb-toolbar');
  }

  bindEvents() {
    const getActiveInstance = () => Lightbox.activeInstance || this;

    this.overlay.querySelector('.lb-close').onclick = () => getActiveInstance().close();
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) getActiveInstance().close();
    };

    this.overlay.querySelector('.lb-prev').onclick = (e) => getActiveInstance().prevSlide(e);
    this.overlay.querySelector('.lb-next').onclick = (e) => getActiveInstance().nextSlide(e);
    this.overlay.querySelector('.lb-zoomin').onclick = (e) => getActiveInstance().zoomIn(e);
    this.overlay.querySelector('.lb-zoomout').onclick = (e) => getActiveInstance().zoomOut(e);
    this.overlay.querySelector('.lb-rotateleft').onclick = (e) => getActiveInstance().rotateLeft(e);
    this.overlay.querySelector('.lb-rotateright').onclick = (e) => getActiveInstance().rotateRight(e);
    this.overlay.querySelector('.lb-fullscreen').onclick = (e) => getActiveInstance().toggleFullscreen(e);
    this.overlay.querySelector('.lb-print').onclick = (e) => getActiveInstance().printImage(e);
    this.overlay.querySelector('.lb-download').onclick = (e) => getActiveInstance().downloadImage(e);

    if (!document._lightboxKeydownHandler) {
      document._lightboxKeydownHandler = (e) => {
        const instance = Lightbox.activeInstance;
        if (!instance || !instance.overlay.classList.contains('active')) return;
        if (instance.pdfViewer) return;
        if (e.key === 'Escape') instance.close();
        if (e.key === 'ArrowLeft') instance.prevSlide(e);
        if (e.key === 'ArrowRight') instance.nextSlide(e);
      };
      document.addEventListener('keydown', document._lightboxKeydownHandler);
    }
  }

  static bind(selector, options = {}) {
    const instance = new Lightbox(options);

    const bindElement = (el) => {
      if (el._lightboxBound) return;
      el._lightboxBound = true;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const groupAttr = el.getAttribute(options.groupAttr || 'data-fancybox');
        const group = (groupAttr === null || groupAttr === '') ? null : (groupAttr || 'default');

        let items = [];

        const getBaseName = (src) => src.split('?')[0].split('&')[0];
        const groupAttrName = options.groupAttr || 'data-fancybox';
        const getGroupItems = () => {
          return Array.from(document.querySelectorAll(selector)).filter((item) => {
            return item.getAttribute(groupAttrName) === group;
          });
        };

        const isPdfUrl = (src) => getBaseName(src).toLowerCase().endsWith('.pdf');
        const model3dExts = ['.stl', '.stp', '.step', '.igs', '.iges'];
        const isModel3dUrl = (src) => model3dExts.some(ext => getBaseName(src).toLowerCase().endsWith(ext));

        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
        const isImageUrl = (src) => imageExts.some(ext => getBaseName(src).toLowerCase().endsWith(ext));
        const detectType = (src) => {
          if (!src) return 'unsupported';
          if (isPdfUrl(src)) return 'pdf';
          if (isModel3dUrl(src)) return 'model3d';
          if (isImageUrl(src)) return 'image';
          return 'iframe';
        };

        if (group === null) {
          const src = el.getAttribute('data-src') || el.getAttribute('href') || '';
          let type = el.getAttribute('data-type');
          if (!type) {
            type = detectType(src);
          }
          items.push({
            src: src,
            type: type,
            title: el.getAttribute('data-caption') || ''
          });
        } else {
          const groupItems = getGroupItems();
          groupItems.forEach((item) => {
            let src = item.getAttribute('data-src') || item.getAttribute('href');
            let type = item.getAttribute('data-type');
            if (!type && src) {
              type = detectType(src);
            }
            items.push({
              src: src,
              type: type,
              title: item.getAttribute('data-caption') || ''
            });
          });
        }

        instance.items = items;
        const currentIndex = group === null ? 0 : getGroupItems().indexOf(el);
        instance.open(currentIndex);
      });
    };

    document.querySelectorAll(selector).forEach(bindElement);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches && node.matches(selector)) {
              bindElement(node);
            }
            node.querySelectorAll && node.querySelectorAll(selector).forEach(bindElement);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return instance;
  }

  static show(items, options = {}) {
    const instance = new Lightbox(options);
    instance.items = items;
    instance.open(0);
    return instance;
  }

  open(index) {
    Lightbox.activeInstance = this;
    this.currentIndex = index;
    this.resetImageState();
    this.showSlide();
    this.overlay.classList.add('active');
  }

  close() {
    this.overlay.classList.remove('active');
    this.cleanupContent();
    if (Lightbox.activeInstance === this) {
      Lightbox.activeInstance = null;
    }
  }

  cleanupContent() {
    if (this.pdfErrorHandler) {
      window.removeEventListener('message', this.pdfErrorHandler);
      this.pdfErrorHandler = null;
    }
    if (this.pdfViewer) {
      try {
        if (typeof this.pdfViewer.destroy === 'function') {
          this.pdfViewer.destroy();
        }
      } catch (err) {
      }
      this.pdfViewer = null;
    }
    if (this.modelInitTimer) {
      clearTimeout(this.modelInitTimer);
      this.modelInitTimer = null;
    }
    if (this.stlViewer) {
      try {
        if (typeof this.stlViewer.Destroy === 'function') {
          this.stlViewer.Destroy();
        } else if (typeof this.stlViewer.Dispose === 'function') {
          this.stlViewer.Dispose();
        }
      } catch (err) {
      }
      this.stlViewer = null;
    }
    this.isDragging = false;
    if (this.content) {
      this.content.innerHTML = '';
    }
  }

  showLoading() {
    this.content.innerHTML = '';
    const loading = document.createElement('div');
    loading.className = 'lb-loading-icon';
    this.content.appendChild(loading);
    return loading;
  }

  showError(message) {
    this.content.innerHTML = '';
    const error = document.createElement('div');
    error.className = 'lb-error';
    const icon = document.createElement('div');
    icon.className = 'lb-error-icon';
    icon.innerHTML = '&#9888;';
    const text = document.createElement('div');
    text.className = 'lb-error-text';
    text.textContent = message;
    error.appendChild(icon);
    error.appendChild(text);
    this.content.appendChild(error);
  }

  createIframe(src) {
    this.showLoading();
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.onload = () => {
      if (!this.content.contains(iframe)) return;
      iframe.classList.add('loaded');
      this.content.querySelector('.lb-loading-icon')?.remove();
    };
    iframe.onerror = () => {
      if (!this.content.contains(iframe)) return;
      this.showError('檔案載入失敗');
    };
    this.content.appendChild(iframe);
    return iframe;
  }

  prevSlide(e) {
    if (e) e.stopPropagation();
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.resetImageState();
    this.showSlide();
  }

  nextSlide(e) {
    if (e) e.stopPropagation();
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.resetImageState();
    this.showSlide();
  }

  resetImageState() {
    this.currentZoom = 1;
    this.currentRotation = 0;
    this.translateX = 0;
    this.translateY = 0;
  }

  showSlide() {
    this.cleanupContent();
    const item = this.items[this.currentIndex];
    if (!item) return;

    const isSingle = this.items.length === 1;
    this.counter.textContent = isSingle ? '' : ((this.currentIndex + 1) + ' / ' + this.items.length);
    this.counter.style.display = isSingle ? 'none' : 'flex';
    this.overlay.querySelector('.lb-prev').style.display = isSingle ? 'none' : 'flex';
    this.overlay.querySelector('.lb-next').style.display = isSingle ? 'none' : 'flex';

    if (item.type === 'image') {
      this.toolbar.style.display = 'flex';
      const fullscreenBtn = this.toolbar.querySelector('.lb-fullscreen');
      if (fullscreenBtn) fullscreenBtn.style.display = 'flex';

      this.showLoading();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.src;
      this.content.appendChild(img);

      img.onload = () => {
        if (!this.content.contains(img)) return;
        img.classList.add('loaded');
        this.content.querySelector('.lb-loading-icon')?.remove();
      };

      img.onerror = () => {
        if (!this.content.contains(img)) return;
        this.content.querySelector('.lb-loading-icon')?.remove();
        this.showError('圖片載入失敗');
      };

      img.addEventListener('dblclick', () => {
        this.currentZoom = 1;
        this.currentRotation = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.updateImageTransform();
      });

      img.addEventListener('mousedown', (e) => {
        if (this.currentZoom <= 1) return;
        this.isDragging = true;
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
        img.style.cursor = 'grabbing';
        e.preventDefault();
      });

      img.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        e.preventDefault();
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        this.updateImageTransform();
      });

      img.addEventListener('mouseup', () => {
        this.isDragging = false;
        img.style.cursor = 'grab';
      });

      img.addEventListener('mouseleave', () => {
        this.isDragging = false;
        img.style.cursor = 'grab';
      });

      this.updateImageTransform();
    } else if (item.type === 'pdf') {
      this.toolbar.style.display = 'none';
      let src = item.src;
      const pdfName = item.src.split('/').pop().split('?')[0];
      const canUseInlinePdfViewer = this.options.usePdfjsViewer !== false
        && !src.includes('pdf-viewer.html')
        && typeof window.LightboxPdfViewer !== 'undefined'
        && typeof window.pdfjsLib !== 'undefined'
        && typeof window.PDFLib !== 'undefined';

      if (canUseInlinePdfViewer) {
        try {
          this.pdfViewer = new window.LightboxPdfViewer({
            container: this.content,
            file: item.src,
            name: item.src,
            onClose: () => this.close()
          });
        } catch (err) {
          this.showError('檔案載入失敗: ' + pdfName);
        }
        return;
      }

      if (this.options.usePdfjsViewer !== false) {
        if (!src.includes('pdf-viewer.html')) {
          src = `${this.options.pdfViewerUrl}?file=${encodeURIComponent(item.src)}&name=${encodeURIComponent(item.src)}`;
        }
        const errorHandler = (event) => {
          const iframe = this.content.querySelector('iframe');
          if (!iframe || event.source !== iframe.contentWindow) return;
          if (event.data?.type === 'pdf-close') {
            window.removeEventListener('message', errorHandler);
            this.pdfErrorHandler = null;
            this.close();
            return;
          }
          if (event.data?.type === 'pdf-error') {
            window.removeEventListener('message', errorHandler);
            this.pdfErrorHandler = null;
            if (iframe) {
              iframe.remove();
              this.content.querySelector('.lb-loading-icon')?.remove();
              this.showError('檔案載入失敗: ' + pdfName);
            }
          }
        };
        this.pdfErrorHandler = errorHandler;
        window.addEventListener('message', errorHandler);
      }
      this.createIframe(src);
    } else if (item.type === 'model3d') {
      this.toolbar.style.display = 'none';
      const stlName = item.src.split('/').pop().split('?')[0];
      const stlContainerId = 'lb-stl-container-' + Date.now();
      this.showLoading();
      const stlContainer = document.createElement('div');
      stlContainer.id = stlContainerId;
      stlContainer.className = 'lb-stl-viewer';
      this.content.appendChild(stlContainer);

      const _this = this;
      let modelLoaded = false;

      const initViewer = function() {
        const container = document.getElementById(stlContainerId);
        if (container) {
          if (typeof OV !== 'undefined') {
            const originalDownloadBtn = document.createElement('button');
            originalDownloadBtn.className = 'lb-stl-original-download';
            originalDownloadBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
            originalDownloadBtn.title = '下載原檔';
            originalDownloadBtn.onclick = function() {
              const link = document.createElement('a');
              link.href = item.src;
              link.download = stlName;
              link.click();
            };
            container.appendChild(originalDownloadBtn);

            const exportBtn = document.createElement('button');
            exportBtn.className = 'lb-stl-download';
            exportBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
            exportBtn.title = '匯出';
            exportBtn.onclick = function() {
              if (!modelLoaded) {
                alert('模型載入中，請稍後再試');
                return;
              }

              const exportTypes = [
                { value: 'obj', label: 'OBJ', format: 'Text' },
                { value: 'stl', label: 'STL', format: 'Text' },
                { value: 'ply', label: 'PLY', format: 'Text' },
                { value: 'gltf', label: 'GLTF', format: 'Text' },
                { value: 'glb', label: 'GLB', format: 'Binary' },
                { value: 'off', label: 'OFF', format: 'Text' },
                { value: 'bim', label: 'BIM', format: 'Text' }
              ];

              const dialog = document.createElement('div');
              dialog.className = 'lb-export-dialog';
              dialog.innerHTML = `
                <div class="lb-export-dialog-content">
                  <h3>選擇匯出格式</h3>
                  <select class="lb-export-select">
                    ${exportTypes.map((t, i) => `<option value="${i}">${t.label}</option>`).join('')}
                  </select>
                  <div class="lb-export-dialog-buttons">
                    <button class="lb-export-cancel">取消</button>
                    <button class="lb-export-confirm">匯出</button>
                  </div>
                </div>
              `;

              dialog.querySelector('.lb-export-cancel').onclick = () => dialog.remove();
              dialog.querySelector('.lb-export-confirm').onclick = () => {
                const select = dialog.querySelector('.lb-export-select');
                const idx = parseInt(select.value);
                const exportType = exportTypes[idx];
                const exportSettings = new OV.ExporterSettings();
                const exporter = new OV.Exporter();
                const model = viewer.GetModel();
                const fileFormat = OV.FileFormat[exportType.format];

                exporter.Export(model, exportSettings, fileFormat, exportType.value, {
                  onSuccess: function(files) {
                    if (files.length > 0) {
                      const file = files[0];
                      const url = OV.CreateObjectUrl(file.GetBufferContent());
                      const link = document.createElement('a');
                      link.href = url;
                      const baseName = stlName.replace(/\.[^/.]+$/, '');
                      link.download = baseName + '.' + exportType.value;
                      link.click();
                    }
                    dialog.remove();
                  },
                  onError: function() {
                    alert('匯出失敗');
                    dialog.remove();
                  }
                });
              };

              dialog.onclick = (e) => {
                if (e.target === dialog) dialog.remove();
              };

              document.body.appendChild(dialog);
            };
            container.appendChild(exportBtn);

            let viewer = null;
            viewer = new OV.EmbeddedViewer(container, {
              width: '100%',
              height: '100%',
              backgroundColor: new OV.RGBAColor(45, 45, 45, 180),
              onModelLoaded: function() {
                if (_this.stlViewer !== viewer) return;
                modelLoaded = true;
                exportBtn.classList.add('visible');
                originalDownloadBtn.classList.add('visible');
                _this.content.querySelector('.lb-loading-icon')?.remove();
              },
              onModelError: function() {
                if (_this.stlViewer !== viewer) return;
                _this.showError('模型載入失敗: ' + stlName);
              }
            });
            _this.stlViewer = viewer;
            try {
              viewer.LoadModelFromUrlList([item.src]);
            } catch (err) {
              _this.showError('模型載入失敗: ' + stlName);
            }

            setTimeout(() => {
              if (_this.stlViewer === viewer) {
                viewer.Resize();
              }
            }, 100);
          } else {
            _this.modelInitTimer = setTimeout(initViewer, 200);
          }
        }
      };
      initViewer();
    } else if (item.type === 'iframe') {
      this.toolbar.style.display = 'none';
      this.createIframe(item.src);
    } else {
      this.toolbar.style.display = 'none';
      this.showError('不支援的檔案格式');
    }
  }

  updateImageTransform() {
    const img = this.content.querySelector('img');
    if (img) {
      img.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentZoom}) rotate(${this.currentRotation}deg)`;
      img.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
    }
  }

  zoomIn(e) {
    if (e) e.stopPropagation();
    const img = this.content.querySelector('img');
    if (img) img.style.transition = 'transform 0.3s ease';
    this.currentZoom = Math.min(this.currentZoom + 0.5, 4);
    if (this.currentZoom === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
    setTimeout(() => this.updateImageTransform(), 10);
  }

  zoomOut(e) {
    if (e) e.stopPropagation();
    const img = this.content.querySelector('img');
    if (img) img.style.transition = 'transform 0.3s ease';
    this.currentZoom = Math.max(this.currentZoom - 0.5, 0.5);
    if (this.currentZoom === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
    setTimeout(() => this.updateImageTransform(), 10);
  }

  rotateLeft(e) {
    if (e) e.stopPropagation();
    const img = this.content.querySelector('img');
    if (img) img.style.transition = 'transform 0.3s ease';
    this.currentRotation -= 90;
    this.translateX = 0;
    this.translateY = 0;
    setTimeout(() => this.updateImageTransform(), 10);
  }

  rotateRight(e) {
    if (e) e.stopPropagation();
    const img = this.content.querySelector('img');
    if (img) img.style.transition = 'transform 0.3s ease';
    this.currentRotation += 90;
    this.translateX = 0;
    this.translateY = 0;
    setTimeout(() => this.updateImageTransform(), 10);
  }

  toggleFullscreen(e) {
    if (e) e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  printImage(e) {
    if (e) e.stopPropagation();
    const img = this.content.querySelector('img');
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rotation = this.currentRotation % 360;
    const isRotated90 = Math.abs(rotation) === 90;

    if (isRotated90) {
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const isLandscape = canvas.width > canvas.height;
    const orientation = isLandscape ? 'landscape' : 'portrait';

    canvas.toBlob((blob) => {
      if (!blob) {
        alert('無法列印');
        return;
      }
      const url = URL.createObjectURL(blob);
      const maxWidth = isLandscape ? '297mm' : '210mm';
      const maxHeight = isLandscape ? '210mm' : '297mm';
      printJS({
        printable: url,
        type: 'image',
        style: `@page { size: A4 ${orientation}; margin: 0; } html, body { margin: 0; padding: 0; height: 100%; display: flex; align-items: center; justify-content: center; } img { max-width: ${maxWidth}; max-height: ${maxHeight}; width: auto; height: auto; display: block; margin: auto; }`
      });
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  downloadImage(e) {
    if (e) e.stopPropagation();
    const img = this.content.querySelector('img');
    if (!img) return;
    const rawName = this.items[this.currentIndex].src.split('/').pop();
    const fileName = rawName.split('?')[0].split('&')[0];
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('無法下載：圖片可能存在跨域問題，請嘗試在圖片上新標籤頁打開後另存為');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

const Fancybox = Lightbox;
