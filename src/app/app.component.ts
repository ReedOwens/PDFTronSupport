import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import WebViewer from '@pdftron/webviewer';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer') viewer: ElementRef;
  instance: any;

  ngAfterViewInit(): void {

    WebViewer({
      path: '../lib',
      fullAPI: true,
      isAdminUser: false,
      loadAsPDF: true,
      enableMeasurement: true,
      notesInLeftPanel: false,
      enableFilePicker: true,
      enableRedaction: true,
      licenseKey: ''
    }, this.viewer.nativeElement).then(instance => {
      this.instance = instance;

      // now you can access APIs through this.webviewer.getInstance()
      instance.openElements(['notesPanel']);
      // see https://www.pdftron.com/documentation/web/guides/ui/apis for the full list of APIs

      // or listen to events from the viewer element
      this.viewer.nativeElement.addEventListener('pageChanged', (e) => {
        const [ pageNumber ] = e.detail;
        console.log(`Current page is ${pageNumber}`);
      });

      // or from the docViewer instance
      instance.docViewer.on('annotationsLoaded', () => {
        console.log('annotations loaded');
      });

      instance.setHeaderItems(header => {
        header.unshift({
          type: 'actionButton',
          img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#abb0c4;}</style></defs><title>icon - header - download</title><path class="cls-1" d="M11.55,17,5.09,9.66a.6.6,0,0,1,.45-1H8.67V2.6a.6.6,0,0,1,.6-.6h5.46a.6.6,0,0,1,.6.6V8.67h3.13a.6.6,0,0,1,.45,1L12.45,17A.6.6,0,0,1,11.55,17ZM3.11,20.18V21.6a.4.4,0,0,0,.4.4h17a.4.4,0,0,0,.4-.4V20.18a.4.4,0,0,0-.4-.4h-17A.4.4,0,0,0,3.11,20.18Z"/></svg>',
          onClick: () => {
            console.log('Download');
            this.doDownload();
          }
        });
      });

      instance.docViewer.on('documentLoaded', this.wvDocumentLoadedHandler);

      instance.docViewer.loadDocument('/files/SAAR.pdf', {         // DOCX
        filename: 'SAAR.pdf',
        useDownloader: true,
        customHeaders: {
         // 'X-UserToken': this.token
        },
        withCredentials: true,
        extension: 'pdf'
      }).then( info => {
        console.error('DOC Loaded ', info);
      })
    })
  }

  ngOnInit() {
    this.wvDocumentLoadedHandler = this.wvDocumentLoadedHandler.bind(this);
  }

  wvDocumentLoadedHandler(): void {
  }


  async doDownload() {
    const annotManager = await this.instance.annotManager;
    const doc = await this.instance.docViewer.getDocument();
    const xfdfString = await annotManager.exportAnnotations();
    const saveOptions = this.instance.CoreControls.SaveOptions;
    const options = {
      xfdfString,
      includeAnnotations: true,
      flags: saveOptions.INCREMENTAL,
      downloadType: 'pdf'
    }

    //const data1 = await doc.getFileData(options);
    const data = await doc.getFileData(options);
// Just made this change

    const arr = new Uint8Array(data);
    const blob = new Blob([arr], {type: 'application/pdf'});
    const name = 'SAAR-PDFTRON.pdf';
    saveAs(blob,name);
  }
}
