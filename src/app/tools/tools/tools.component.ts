import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ToolsService } from './tools.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  base64: any;
  uploadedFile: any;
  navbarOpen = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    private toolsService: ToolsService
  ) { 
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/tools/export') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
    // this.breadcrumb.hide();
    this.sharedService.showMenuBar.subscribe(res => {
      this.navbarOpen = res;
    });

    this.sharedService.isChangeBgColor.next(true);
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  uploadFile(event) {
    const fileList: FileList = event.target.files;
    this.uploadedFile = fileList[0];
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.handleInputChange(file); // turn into base64
    } else {
      alert('No file selected');
    }
  }

  handleInputChange(files) {
    const file = files;
    const pattern = /-*/;
    const reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onloadend = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e) {
    const reader = e.target;
    const base64result = reader.result.substr(reader.result.indexOf(',') + 1);
    this.base64 = base64result;
  }

  submitFile() {
    const fileObj = {
      lastModified: this.uploadedFile?.lastModified,
      lastModifiedDate: this.uploadedFile?.lastModifiedDate,
      fileName: this.uploadedFile?.name,
      size: this.uploadedFile?.size,
      type: this.uploadedFile?.type,
      webkitRelativePath: this.uploadedFile?.webkitRelativePath,
      encryptedContents: this.base64
    };
    // this.toolsService.importFile(fileObj).subscribe(res => {
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });
  }

}
