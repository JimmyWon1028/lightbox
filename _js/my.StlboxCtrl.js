(function($g) {
  /**
   * Ref Control
   * Last Modified: 2015.08.30
   * Author: Jimmy
   */
  function StlboxCtrl(flna, fn) {
    this.flna = flna;
    this.winId = getGuid();
    this.stlWinId = getGuid();
    this.w = 750;
    this.h = 720;
    this.fn = fn;
    this.onClose = undefined;
    this.onCancel = undefined;
    this.apiUrl = $g['api_root'];
    this.apiImagePath = this.apiUrl+'image/prdimg/';
    var obj = this;

    /**
     * Method
     */
    this.ini = function() {
      //
    }

    //2014.06.24 add bind button
    this.bindIconButton = function(btn) {
      btn.off('click');
      btn.off('click');
      btn.click(obj.clickIconButton);
    }

    this.clickIconButton = function (e) {
      if ($('#'+obj.winId).is(":visible")) return;

      var icon = 'icon-popwin';
      var winHtml =
        `<div id="${obj.winId}" style="display:flex;justify-content:center;align-items:center;" data-options="iconCls:'${icon}'">
          <div id="${obj.stlWinId}" style="width:620px;height:620px;padding:6px;">載入中</div>
        </div>`;

      var btns = [];

      btns.push({
        text:i18nTag('{下載}'),
        iconCls:'icon-download',
        handler: ()=>{
          const ext = flna.substr(flna.length - 4).toLowerCase();
          if (in_array (ext, ['.stl', '.stp', '.step', '.igs', '.iges'])) {
            let exportTypes = {
              '020' : { fileFormat: OV.FileFormat.Text, extension: 'obj', },
              '030' : { fileFormat: OV.FileFormat.Text, extension: 'stl', },
              '040' : { fileFormat: OV.FileFormat.Binary, extension: 'stl', },
              '050' : { fileFormat: OV.FileFormat.Text, extension: 'ply', },
              '060' : { fileFormat: OV.FileFormat.Binary, extension: 'ply', },
              '070' : { fileFormat: OV.FileFormat.Text, extension: 'gltf', },
              '080' : { fileFormat: OV.FileFormat.Binary, extension: 'glb', },
              '090' : { fileFormat: OV.FileFormat.Text, extension: 'off', },
              '100' : { fileFormat: OV.FileFormat.Binary, extension: '3dm', },
              '110' : { fileFormat: OV.FileFormat.Text, extension: 'bim', },
            }

            var opt = {
              width: 400,
              editors: [{
                label: '{選擇格式}',
                width: 250,
                // editor: 'textbox',
                editor: 'combobox',
                limitlist: 'Y',
                refno: 'o3dv_export',
              }],
            }
            msgBoxp('{匯出}', opt, (exportType_str) => {
              if (exportType_str=='010') {
                downloadFile(obj.flna,'img')
              } else if (exportTypes[exportType_str]) {
                let exportType = exportTypes[exportType_str];
                let viewer_settings = new OV.ExporterSettings();
                let viewer_export = new OV.Exporter();
                showProgress('{匯出中}')
                viewer_export.Export(obj.viewer.GetModel(), viewer_settings, exportType.fileFormat, exportType.extension, {
                  onError: (r) => {
                    addMsgNotice('匯出現錯誤', 'error')
                  },
                  onSuccess : (files) => {
                    if (files.length === 0) {
                      addMsgNotice('無法產生檔案', 'error')
                      hideProgress();
                    } else if (files.length === 1) {
                      let file = files[0];
                      hideProgress();
                      addMsgNotice('下載中', 'success')
                      DownloadArrayBufferAsFile (file.GetBufferContent (), file.GetName ());
                    } else if (files.length > 1) {
                      
                      // let filesInZip = {};
                      // for (let file of files) {
                      //     filesInZip[file.name] = new OV.Uint8Array (file.content);
                      // }
                      // let zippedContent = fflate.zipSync (filesInZip);
                      // let zippedBuffer = zippedContent.buffer;
                      addMsgNotice('尚未製作', 'error')
                      hideProgress();
                      // DownloadArrayBufferAsFile (zippedBuffer, 'model.zip');
                    }
            
                    function DownloadArrayBufferAsFile (arrayBuffer, fileName) {
                      let url = OV.CreateObjectUrl (arrayBuffer);
                      // con(fileName, url)
                      // saveToDonwload(fileName, url)
                      DownloadUrlAsFile (url, fileName);
                    }

                    function DownloadUrlAsFile (url, fileName) {
                      let link = document.createElement ('a');
                      link.href = url;
                      link.download = fileName;
                      document.body.appendChild (link);
                      link.click ();
                      document.body.removeChild (link);
                    }
                  }
                })

              }
            })
          } else {
            downloadFile(obj.flna,'img')
          }
        }
        },{
        text:i18nTag('{關閉}'),
        iconCls:'icon-close',
        handler: obj.closeWin
        });

      var toolbtns = []

      $(document.body).append(winHtml);
      $('#'+obj.winId).dialog({
        title: i18nTag('STL {檢視器}'),
        width:obj.w,
        height:obj.h,
        modal:true,
        resizable: true,
        maximizable: true,
        maximized: true,
        minimizable: false,
        collapsible: true,
        closable: true,
        closed: true,
        onBeforeClose: obj.freeRef,
        buttons: btns,
        tools:toolbtns,
        border: $g.winBorder,
      });

      var win = $('#'+obj.winId);
      //resize ref window
      win.panel('resize',{
        width: obj.w,
        height: obj.h
      });
      win.dialog('center');
      //the two lines for rerange each element
      win.dialog('maximize');
      win.dialog('restore');

      translate( $('#'+obj.winId).dialog('panel') );
      //Open ref window
      win.dialog('open');
      obj.setStlviewer(obj.flna);
    }

    this.setStlviewer = (flna) => {
      stlViewer = $(`#${obj.stlWinId}`);
      stlViewer.empty();
      const ext = flna.substr(flna.length - 4).toLowerCase();
      let imgsrc = obj.apiImagePath+flna+'?_dbconna='+getCookie('last_select_database');
      // if (ext=='.stl') {
      //   new StlViewer(stlViewer[0], {
      //     models: [{
      //       id: -1,
      //       filename: imgsrc,
      //       // color: "#0070ca",
      //       view_edges: false,
      //       display: "flat",
      //         opacity: 0.9
      //       }],
      //       auto_rotate: false,
      //       auto_resize: false,
      //       //zoom: 100,
      //       center_models: true,
      //       bgcolor: 'white',
      //   });
      // } 
      if (in_array (ext, ['.stl', '.stp', '.step', '.igs', '.iges'])) { // 2024.03.05 Brian find new library
        let viewer_html = `<div class="online_3d_viewer"
            style="width: 100%; height: 100%;">
        </div>`;
        stlViewer.append(viewer_html);
        // OV.Init3DViewerElements();

        let parentDiv = $(`#${obj.stlWinId} .online_3d_viewer`)[0];

        // initialize the viewer with the parent element and some parameters
        obj.viewer = new OV.EmbeddedViewer (parentDiv, {});

        // load a model providing model urls
        obj.viewer.LoadModelFromUrlList ([
            imgsrc
        ]);
        obj.viewer.Resize();
      } else {
        imgsrc += '?width=600&'+rand();
        stlViewer.append(`<img src="${imgsrc}">`)
      }
    }

    //alias
    this.open = this.clickIconButton;

    this.closeWin = function() {
      $('#'+obj.winId).window('close');
      // con(6666)
    }

    this.freeRef = function() {
      $(`#${obj.stlWinId}`).empty();
      if (typeof obj.fn!=='undefined'){
        obj.fn();
      }
    }

    /**
     * Set
     */

    /**
     * Event
     */
    this.onLoadError = function() {
      con('load error')
    }

    this.keydownFunc = function(e) {
      // e.preventDefault();
      if (e.keyCode == 27) {  // esc
      }
    }
  }

  window.StlboxCtrl = StlboxCtrl;
})($g);

