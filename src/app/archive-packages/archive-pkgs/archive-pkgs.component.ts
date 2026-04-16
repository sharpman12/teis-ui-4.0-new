import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from '../../shared/components/confirmation/confirmation.component';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { HeaderService } from '../../core/service/header.service';
import { SharedService } from '../../shared/services/shared.service';
import { AddEditArchivePkgComponent } from './add-edit-archive-pkg/add-edit-archive-pkg.component';
import { ArchiveLogDataService } from './archive-log-data.service';
import { ArchivePakgsService } from './archive-pakgs.service';
import { CreateReport } from './archive-pkgs';
import { MessageService } from 'primeng/api';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-archive-pkgs',
  templateUrl: './archive-pkgs.component.html',
  styleUrls: ['./archive-pkgs.component.scss']
})
export class ArchivePkgsComponent implements OnInit, OnDestroy {
  selectedTabIndex = 0;
  openDropDown = false;
  items = [
    { id: 1, header: 'Archive Log' },
  ];
  cards = [];
  selectedCard: any;
  showModal = false;
  saveLogSearchReportForm: UntypedFormGroup;
  isDuplicateErrShow = false;
  updated_card: any;
  currentTabIndex: any;
  isNewReport = false;
  isLoading = false;

  constructor(
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    private dialog: MatDialog,
    private archivePakgsService: ArchivePakgsService,
    private el: ElementRef,
    private archiveLogDataService: ArchiveLogDataService,
    private messageService: MessageService,
    private fb: UntypedFormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/archive_packages_log') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.createForm();
    this.getArchiveReports();
    this.sharedService.isChangeBgColor.next(true);
    this.saveLogSearchReportForm.get('reportType').valueChanges.subscribe(res => {
      if (res === 'existingReport') {
        this.isNewReport = false;
        this.saveLogSearchReportForm.patchValue({
          reportName: this.updated_card?.cardName,
          reportDescription: this.updated_card?.cardDesc,
        });
        this.saveLogSearchReportForm.get('reportName').disable();
      } else {
        this.isNewReport = true;
        this.saveLogSearchReportForm.patchValue({
          reportName: '',
          reportDescription: '',
        });
        this.saveLogSearchReportForm.get('reportName').enable();
      }
    });
    // this.sharedService.isArchiveTabsClose.subscribe(res => {
    //   if (res && this.items?.length > 1) {
    //     this.closedAllTabs();
    //   }
    // });
  }

  closedAllTabs() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: 'Are you sure you want to remove this group?',
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['dashboard']);
        // this.sharedService.isArchiveTabsClose.next(false);
      }
    });
  }

  createForm() {
    this.saveLogSearchReportForm = this.fb.group({
      reportType: [{ value: 'existingReport', disabled: false }, {
        validators: [Validators.required]
      }],
      reportName: [{ value: '', disabled: true }, {
        validators: [Validators.required]
      }],
      reportDescription: [{ value: '', disabled: false }, {
        validators: []
      }],
    });
  }

  cardData(item: any) {
    this.selectedCard = '';
    this.selectedCard = item;
    this.archiveLogDataService?.openArchiveLogs(item);
    this.items.push({ id: item?.id, header: item?.name });
    this.sharedService.openArchiveTabs(this.items);
    this.selectedTabIndex = this.items?.length - 1;
    // this.sharedService.getArchiveLogsOpenTabs(this.items);
  }

  // updateLog(event: any) {
  //   if (event?.isUpdate) {
  //     this.getArchiveReports();
  //     // this.items.forEach((el, i, arr) => {
  //     //   setTimeout(() => {
  //     //     if (el?.id === event?.cardId) {
  //     //       this.selectedCard = this.selectedCard;
  //     //     }
  //     //   }, 0);
  //     // });
  //   }
  //   if (event?.isDelete) {
  //     this.getArchiveReports();
  //     this.items.forEach((el, i, arr) => {
  //       setTimeout(() => {
  //         if (el?.id === event?.cardId) {
  //           arr.splice(i, 1);
  //           this.selectedTabIndex = arr?.length - 1;
  //         }
  //       }, 0);
  //     });
  //   }
  // }

  updateLog(event: any) {
     if (event?.isUpdate) {
      this.getArchiveReports();
      // this.items.forEach((el, i, arr) => {
      //   setTimeout(() => {
      //     if (el?.id === event?.cardId) {
      //       this.selectedCard = this.selectedCard;
      //     }
      //   }, 0);
      // });
    }
  if (event?.isDelete) {

    // Remove from tabs
    this.items = this.items.filter(item => item.id !== event.cardId);

    // Select last available card
    const lastItem = this.items[this.items.length - 1];
    if (lastItem) {
      const cards = this.archiveLogDataService.getOpenArchiveLogs();
      this.selectedCard = cards.find(c => c.id === lastItem.id);
      this.selectedTabIndex = this.items.length - 1;
    } else {
      this.selectedCard = null;
      this.selectedTabIndex = 0;
    }

    this.getArchiveReports();
  }
}


  setIndex(e) {
    this.selectedTabIndex = e;
    const cards = this.archiveLogDataService?.getOpenArchiveLogs();
    cards.forEach((item, i, arr) => {
      if (i === (e?.index - 1)) {
        this.selectedCard = item;
      }
    });
    // this.logDataService.setActiveTabIndex(e);
  }

  /*========= Tab Closed ==========*/
  handleClose(e) {
    console.log('close');
    this.currentTabIndex = null;
    const index = e.index;
    this.currentTabIndex = index;
    let selectedTabItemId;
    let openTabs;
    this.items.forEach((item, i, arr) => {
      setTimeout(() => {
        if (i === index) {
          if (this.updated_card?.isLogSearched) {
            this.showModal = true;
            if (this.updated_card?.isdefaultCard) {
              this.saveLogSearchReportForm.get('reportType').disable();
              this.saveLogSearchReportForm.patchValue({
                reportType: 'newReport'
              });
            } else {
              this.saveLogSearchReportForm.get('reportType').enable();
              this.saveLogSearchReportForm.patchValue({
                reportType: 'existingReport',
                reportName: this.updated_card?.cardName,
                reportDescription: this.updated_card?.cardDesc,
              });
            }
          } else {
            this.showModal = false;
            arr.splice(i, 1);
            openTabs = arr;
            selectedTabItemId = arr[arr?.length - 1]?.id;
            if (selectedTabItemId) {
              const cards = this.archiveLogDataService?.getOpenArchiveLogs();
              cards.forEach((el, ind, crdArr) => {
                if (el?.id === selectedTabItemId) {
                  this.selectedCard = el;
                }
              });
            }
            this.selectedTabIndex = arr?.length - 1;
          }
        }
      }, 0);
    });
    this.archiveLogDataService?.closeArchiveLogs(index);
    this.sharedService.openArchiveTabs(openTabs);
    // this.sharedService.getArchiveLogsOpenTabs(this.items);

    // const openTabIndex = index - 1;
    // let updatedTabs = [];
    // this.archiveLogDataService.updatedTabsAnnounced$.subscribe(result => {
    //   updatedTabs = result;
    // });
    // updated tabs will show pop up
    // if (updatedTabs[openTabIndex] === 'true') {
    //   this.show(index);
    // } else {
    //   this.openLogsCards.splice(index, 1);
    //   this.closeTabItem(index);
    //   this.removeUpdatedTabItem(index - 1);
    // }
  }

  activeTab($event) {
    this.selectedTabIndex = $event.index;
    const el = this.el.nativeElement.querySelector('.ui-tabview-nav');
    const el1 = this.el.nativeElement.querySelector('.ui-state-default');
    el.scrollLeft = (this.selectedTabIndex * el1.offsetWidth);
    // this.setIndex($event.index);
  }

  addArchivePackage() {
    const obj = { isAdd: true };
    const dialogRef = this.dialog.open(AddEditArchivePkgComponent, {
      width: '1278px',
      height: '680px',
      data: obj,
      panelClass: 'custom-dialog-container'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isClosed) {
        this.getArchiveReports();
        this.messageService.add({ key: 'archivePkgKey', severity: 'success', summary: '', detail: 'Log created successfully!' });
      }
    });
  }

  getArchiveReports() {
    this.archivePakgsService.getArchiveReports().subscribe(res => {
      this.cards = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*=========== Edit Card ===========*/
  editCard(event: any, cardData: CreateReport) {
    event.stopPropagation();
    cardData.isAdd = false;
    const dialogRef = this.dialog.open(AddEditArchivePkgComponent, {
      width: '1150px',
      height: '650px',
      data: cardData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isClosed) {
        this.getArchiveReports();
        this.messageService.add({ key: 'archivePkgKey', severity: 'success', summary: '', detail: 'Log updated successfully!' });
      }
    });
  }
  /*=========== END Edit Card ===========*/

  /*=========== Delete Card ===========*/
  deleteCard(event: any, cardId: number, cardName: string) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: 'Are you sure you want to remove this log?',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        event.stopPropagation();
        this.archivePakgsService.deleteArchiveReport(cardId).subscribe(res => {
          if (res) {
            this.getArchiveReports();
            this.messageService.add({ key: 'archivePkgKey', severity: 'success', summary: '', detail: 'Log deleted successfully!' });
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
            this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
          }
        });
      }
    });
  }
  /*=========== END Delete Card ===========*/

  /*=========== Navigate between the tabs ===========*/
  prev() {
    this.selectedTabIndex = this.selectedTabIndex - 1;
    const el = this.el.nativeElement.querySelector('.ui-tabview-nav');
    const el1 = this.el.nativeElement.querySelector('.ui-state-default');
    el.scrollLeft -= el1.offsetWidth;
    this.setIndex(this.selectedTabIndex);
  }

  next() {
    this.selectedTabIndex = this.selectedTabIndex + 1;
    const el = this.el.nativeElement.querySelector('.ui-tabview-nav');
    const el1 = this.el.nativeElement.querySelector('.ui-state-default');
    el.scrollLeft += el1.offsetWidth;
    this.setIndex(this.selectedTabIndex);
  }
  /*=========== END Navigate between the tabs ===========*/

  /*=========== Check Duplicate Report Name ============*/
  duplicateReportName(report_name: string) {
    this.archivePakgsService.checkDuplicateReport(report_name).subscribe(res => {
      if (res) {
        this.isDuplicateErrShow = true;
        this.saveLogSearchReportForm.get('reportName').reset();
      } else {
        this.isDuplicateErrShow = false;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }
  /*=========== END Check Duplicate Report Name ============*/

  /*======= Create New Report =======*/
  saveReport() {
    const formValues = this.saveLogSearchReportForm.getRawValue();
    const archiveData = {
      defaultValue: false,
      description: formValues?.reportDescription,
      error: false,
      errorCount: 0,
      id: null,
      items: this.updated_card?.items,
      name: formValues?.reportName,
      searchText: this.updated_card?.searchStr,
      timeFrame: this.updated_card?.timeFrame
    };
    this.isLoading = true;
    this.archivePakgsService.createArchiveReport(archiveData).subscribe(res => {
      this.getArchiveReports();
      this.updated_card.isLogSearched = false;
      this.handleClose({ index: this.currentTabIndex });
      this.isLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*======= Update Existing Report =======*/
  updateReport() {
    const formValues = this.saveLogSearchReportForm.getRawValue();
    const archiveData = {
      defaultValue: false,
      description: formValues?.reportDescription,
      error: false,
      errorCount: 0,
      id: this.updated_card?.cardId,
      items: this.updated_card?.items,
      name: formValues?.reportName,
      searchText: this.updated_card?.searchStr,
      timeFrame: this.updated_card?.timeFrame
    };
    this.isLoading = true;
    this.archivePakgsService.editArchiveReport(archiveData).subscribe(res => {
      this.getArchiveReports();
      this.updated_card.isLogSearched = false;
      this.handleClose({ index: this.currentTabIndex });
      this.isLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*======= On Cancel Save Report =======*/
  onCancel() {
    this.showModal = false;
    this.updated_card.isLogSearched = false;
    this.handleClose({ index: this.currentTabIndex });
  }

  ngOnDestroy() {
    // this.items = [
    //   { id: 1, header: 'Archive home' },
    // ];
    this.sharedService.openArchiveTabs([]);
  }

}
