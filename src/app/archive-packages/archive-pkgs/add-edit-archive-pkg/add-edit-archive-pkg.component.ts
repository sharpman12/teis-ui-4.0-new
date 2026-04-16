import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
// import { TreeNode } from 'primeng';
import { take } from 'rxjs/operators';
import { CustomValidator } from 'src/app/shared/validation/custom.validation';
import { ArchivePakgsService } from '../archive-pakgs.service';
import { CreateReport, Workspaces } from '../archive-pkgs';
import { ArchiveFunctionalMap } from '../archivefunctionalmap';
import { MessageService, TreeNode } from 'primeng/api';

@Component({
  selector: 'app-add-edit-archive-pkg',
  templateUrl: './add-edit-archive-pkg.component.html',
  styleUrls: ['./add-edit-archive-pkg.component.scss']
})
export class AddEditArchivePkgComponent implements OnInit {
  activeIndex = 0;
  stepOneForm: UntypedFormGroup;
  stepTwoForm: UntypedFormGroup;
  stepThreeForm: UntypedFormGroup;
  workSpaces = [];
  workspaces: Array<Workspaces> = [];
  selectedWs: Array<Workspaces> = [];
  public arrTree: TreeNode[] = [];
  selectedFile: any[] = [];
  selectedItems = [];
  maxDate = new Date();
  isDateRangeShow = false;
  isErrMsgShow = false;
  selectedTimeFrame: string;
  showTimeframe: string;
  timeFrameList = [
    // { id: 'Today', value: 'Today' },
    { id: 'last-day', value: 'last-day' },
    { id: 'last-7days', value: 'last-7days' },
    { id: 'last-month', value: 'last-month' },
    { id: 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss', value: 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss' },
  ];
  timeFrame = '';
  selectedWsIds = [];
  validateString: any;
  tagName: any;
  tagValue: any;
  searchInputValue: string;
  displaySearch: string;
  isValidSearch: any;
  validationResult = [];
  isDuplicateErrShow = false;
  isWsSelected = false;

  constructor(
    public dialogRef: MatDialogRef<AddEditArchivePkgComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private archivePakgsService: ArchivePakgsService,
    private messageService: MessageService,
  ) {
    this.dialogRef.disableClose = true;
    this.getWorkspaces();
  }

  ngOnInit(): void {
    this.createStepOneForm();
    this.createStepThreeForm();
    // this.getArchiveTimeFrame();
    if (!this.dialogData?.isAdd) {
      this.getEditData(this.dialogData);
    }
  }

  getArchiveTimeFrame() {
    this.archivePakgsService.getArchiveTimeFrames().subscribe(res => {
      // console.log(res);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*========== On Selected Timeframe ===========*/
  onSelectTimeFrame(timeFrame: string) {
    if (timeFrame === 'Today') {
      this.timeFrame = timeFrame;
      this.clearFormDatavalidations(false);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const today_now = `${this.getDateFormat(today)} to ${this.getDateFormat(now)}`;
      this.showTimeframe = today_now;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'last-day') {
      this.timeFrame = timeFrame;
      this.clearFormDatavalidations(false);
      const dt = new Date();
      const start_yesterday = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 0, 0, 0);
      const end_yesterday = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 23, 59, 59);
      const yesterday = `${this.getDateFormat(start_yesterday)} to ${this.getDateFormat(end_yesterday)}`;
      this.showTimeframe = yesterday;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'last-7days') {
      this.timeFrame = timeFrame;
      this.clearFormDatavalidations(false);
      const dt = new Date();
      const start_week = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 7, 0, 0, 0);
      const end_week = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 23, 59, 59);
      const last_1Week = `${this.getDateFormat(start_week)} to ${this.getDateFormat(end_week)}`;
      this.showTimeframe = last_1Week;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'last-month') {
      this.timeFrame = timeFrame;
      this.clearFormDatavalidations(false);
      const dt = new Date();
      const start_month = new Date(dt.getFullYear(), dt.getMonth() - 1, 1, 0, 0, 0);
      const end_month = new Date(dt.getFullYear(), dt.getMonth(), 0, 23, 23, 59);
      const last_1Month = `${this.getDateFormat(start_month)} to ${this.getDateFormat(end_month)}`;
      this.showTimeframe = last_1Month;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss') {
      this.timeFrame = timeFrame;
      let fromDate = '';
      let toDate = '';
      this.clearFormDatavalidations(true);
      this.stepThreeForm.get('fromDate').valueChanges.pipe(take(1)).subscribe(startDate => {
        fromDate = startDate;
        if (startDate) {
          this.isErrMsgShow = true;
          this.stepThreeForm.get('toDate').enable();
          this.stepThreeForm.get('toDate').valueChanges.pipe(take(1)).subscribe(endDate => {
            toDate = endDate;
            if (toDate) {
              this.isErrMsgShow = false;
            }
            if (fromDate && toDate) {
              const custom_date = `${this.getDateFormat(fromDate)} to ${this.getDateFormat(toDate)}`;
              this.showTimeframe = custom_date;
              this.selectedTimeFrame = custom_date;
            }
          });
        }
      });
    }
  }

  OnChangeDate() {
    let fromDate = '';
    let toDate = '';
    fromDate = this.stepThreeForm.get('fromDate').value;
    if (fromDate) {
      this.stepThreeForm.get('toDate').enable();
      if (!this.stepThreeForm.get('toDate').value) {
        this.isErrMsgShow = true;
      }
      toDate = this.stepThreeForm.get('toDate').value;
      if (toDate) {
        if (fromDate > toDate) {
          this.stepThreeForm.get('toDate').reset();
          this.isErrMsgShow = true;
        } else {
          this.isErrMsgShow = false;
          if (fromDate && toDate) {
            const custom_date = `${this.getDateFormat(fromDate)} to ${this.getDateFormat(toDate)}`;
            this.showTimeframe = custom_date;
            this.selectedTimeFrame = custom_date;
          }
        }
      }
    } else {
      this.stepThreeForm.get('toDate').disable();
    }
  }

  getDateFormat(date: any): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  clearFormDatavalidations(isRequired: boolean) {
    this.isErrMsgShow = false;
    this.selectedTimeFrame = '';
    this.showTimeframe = '';
    this.stepThreeForm.get('fromDate').reset();
    this.stepThreeForm.get('toDate').reset();
    this.stepThreeForm.get('toDate').disable();
    if (isRequired) {
      this.isDateRangeShow = true;
      this.stepThreeForm.get('fromDate').setValidators([Validators.required]);
      this.stepThreeForm.get('fromDate').updateValueAndValidity();
      this.stepThreeForm.get('toDate').setValidators([Validators.required]);
      this.stepThreeForm.get('toDate').updateValueAndValidity();
    } else {
      this.isDateRangeShow = false;
      this.stepThreeForm.get('fromDate').clearValidators();
      this.stepThreeForm.get('fromDate').updateValueAndValidity();
      this.stepThreeForm.get('toDate').clearValidators();
      this.stepThreeForm.get('toDate').updateValueAndValidity();
    }
  }

  /*========== END On Selected Timeframe ===========*/

  /*=========== Step One Form ===========*/
  createStepOneForm() {
    this.stepOneForm = this.fb.group({
      reportName: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      reportDescription: [{ value: '', disabled: false }, {
        validators: []
      }]
    });
  }

  /*=========== Step Two Form ===========*/
  createStepTwoForm() {
    this.stepTwoForm = this.fb.group({

    });
  }

  /*=========== Step Three Form ===========*/
  createStepThreeForm() {
    this.stepThreeForm = this.fb.group({
      timeFrame: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      fromDate: [{ value: '', disabled: false }, {
        validators: []
      }],
      toDate: [{ value: '', disabled: true }, {
        validators: []
      }],
      searchText: [{ value: '', disabled: false }, {
        validators: []
      }],
    });
  }

  /*============ Check Duplicate Report ==========*/
  checkDuplicateReport() {
    const report_name = this.stepOneForm.get('reportName').value;
    if (!this.dialogData?.isAdd) {
      if (this.dialogData?.name === report_name) {
        this.activeIndex = 1;
      } else {
        this.duplicateReportName(report_name);
      }
    } else {
      this.duplicateReportName(report_name);
    }
  }

  duplicateReportName(report_name: string) {
    this.archivePakgsService.checkDuplicateReport(report_name).subscribe(res => {
      if (res) {
        this.isDuplicateErrShow = true;
        this.stepOneForm.get('reportName').reset();
      } else {
        this.isDuplicateErrShow = false;
        this.activeIndex = 1;
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
  /*============ END Check Duplicate Report ==========*/

  /*============ Get Edit Data =============*/
  getEditData(data: CreateReport) {
    this.stepOneForm.patchValue({
      reportName: data?.name,
      reportDescription: data?.description,
    });
    if (data?.timeFrame) {
      this.isDateRangeShow = false;
      this.stepThreeForm.get('toDate').disable();
      if (data?.timeFrame === 'Today' ||
        data?.timeFrame === 'last-day' ||
        data?.timeFrame === 'last-7days' ||
        data?.timeFrame === 'last-month') {
        this.timeFrameList.forEach(item => {
          if (item?.id === data?.timeFrame) {
            this.stepThreeForm.patchValue({
              timeFrame: item?.id
            });
          }
        });
      } else {
        this.isDateRangeShow = true;
        this.stepThreeForm.get('toDate').enable();
        const timeRange = data?.timeFrame.split(' to ');
        this.stepThreeForm.patchValue({
          timeFrame: this.timeFrameList[3]?.id,
          fromDate: new Date(timeRange[0]),
          toDate: new Date(timeRange[1]),
        });
      }
      this.stepThreeForm.patchValue({
        searchText: data?.searchText,
      });
    }
    this.onSelectTimeFrame(data?.timeFrame);
  }

  /*=========== Get Workspaces ===========*/
  getWorkspaces() {
    this.archivePakgsService.getWorkspaces().subscribe(res => {
      if (this.dialogData?.isAdd) {
        res.forEach(item => {
          item.selected = false;
        });
      }
      if (!this.dialogData?.isAdd) {
        res.forEach(item => {
          this.dialogData?.items.forEach(ws => {
            if (Number(item?.id) === ws?.workspaceId) {
              item.selected = true;
            }
          });
        });
      }
      this.workspaces = res;
      this.onSelectWS(this.workspaces);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*=========== Next Step Button ===========*/
  nextStep(nextPageNo: number) {
    if (nextPageNo === 0) {
      this.activeIndex = 0;
    }
    if (nextPageNo === 1) {
      // this.activeIndex = 1;
      this.stepOne();
      if (this.stepOneForm.valid && this.selectedWs?.length) {
        // this.activeIndex = 1;
        this.checkDuplicateReport();
        if (this.dialogData?.isAdd) {
          this.getArchiveWsTree(false);
        } else {
          // this.getArchiveWsTree(true);
          this.getArchiveItemTree();
        }
      }
    }
    if (nextPageNo === 2) {
      // this.activeIndex = 2;
      if (this.selectedFile?.length) {
        this.stepTwo();
      }
    }
  }

  /*=========== Previous Step Button ===========*/
  previousStep(previousPageNo: number) {
    if (previousPageNo === 0) {
      this.activeIndex = 0;
    }
    if (previousPageNo === 1) {
      this.activeIndex = 1;
    }
    if (previousPageNo === 2) {
      this.activeIndex = 2;
    }
  }

  /*=========== Step One Data ===========*/
  stepOne() {
    this.stepOneForm.markAllAsTouched();
    const formValue = this.stepOneForm.value;
    this.selectedWs = [];
    this.selectedWsIds = [];
    this.workspaces.forEach(item => {
      if (item?.selected) {
        this.selectedWs.push(item);
        this.selectedWsIds.push(item?.id);
      }
    });
    if (this.stepOneForm.valid && this.selectedWs?.length) {
      // this.activeIndex = 1;
      formValue.selectedWs = this.selectedWs;
    }
  }

  onSelectWS(workspaces: Array<any>) {
    let ws = [];
    this.isWsSelected = false;
    ws = workspaces.filter(item => item.selected);
    if (ws?.length) {
      this.isWsSelected = true;
    } else {
      this.isWsSelected = false;
    }
  }

  collapseAll(nodes: TreeNode[]) {
  nodes.forEach(node => {
    node.expanded = false;
    if (node.children && node.children.length) {
      this.collapseAll(node.children);
    }
  });
}

  /*=========== Get Archive WS Tree ===========*/
  getArchiveWsTree(isEdit: boolean) {
    this.arrTree = [];
    const workspacesIds = this.selectedWsIds;
    this.archivePakgsService.getArchiveWsTree(workspacesIds, isEdit).subscribe(res => {
      if (res) {
        let funMap;
        res.forEach(element => {
          funMap = element;
          this.setChildrenAsSelected(funMap);
          let nodeArray: TreeNode;
          nodeArray = new ArchiveFunctionalMap(funMap, 0);
          if (isEdit) {
            this.countSeletedNode(nodeArray, true);
          }
          this.arrTree.push(nodeArray);
          this.collapseAll(this.arrTree);
        });
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

  getArchiveItemTree() {
    this.arrTree = [];
    const workspacesIds = this.selectedWsIds;
    this.archivePakgsService.getArchiveItemTree(workspacesIds, this.dialogData?.id).subscribe(res => {
      if (res) {
        let funMap;
        res.forEach(element => {
          funMap = element;
          // this.setChildrenAsSelected(funMap);
          let nodeArray: TreeNode;
          nodeArray = new ArchiveFunctionalMap(funMap, 1);
          if (this.dialogData?.id) {
            this.countSeletedNode(nodeArray, true);
          }
          this.arrTree.push(nodeArray);
        });
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

  private setChildrenAsSelected(node: any) {
    node.label = node.name;
    node.expanded = false;
    node.selected = false;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setChildrenAsSelected(node.children[m]);
      }
    }
  }

  /*=================== Check Selected Tree Node ===================*/
  countSeletedNode(nodes, updateSelectedFile: boolean) {
    if (nodes.isSelected === true) {
      if (updateSelectedFile) {
        // Do not update in case of onNodeSelect
        this.selectedFile.push(nodes);
      }
    }
    if (nodes.children !== null) {
      for (let m = 0; m <= nodes.children.length - 1; m++) {
        this.countSeletedNode(nodes.children[m], updateSelectedFile);
      }
    }
  }
  /*=================== END Check Selected Tree Node ===================*/

  nodeSelect(event) {

  }

  nodeUnselect(event) {

  }

  stepTwo() {
    this.selectedItems = [];
    this.activeIndex = 2;
    this.selectedFile.forEach(item => {
      this.selectedItems.push({ workspaceId: item?.workspaceId, itemType: item?.nodeType, itemId: item?.id });
    });
  }

  validateSearch(str): void {
    this.validateString = str;
    if (str) {
      const keyValPairs = str.replace(/(\r\n|\n|\r)/gm, '').split(/[&|]\s/);
      const validationStr = [
        { title: 'freetext=', regex: /.*?\S/gi },
        { title: 'taskid=', regex: /^[a-z0-9-]+$/g },
        { title: 'status=', regex: /\b(complete|error|active|hold|inputhold|done)\b/gm },
        { title: 'logtype=', regex: /\b(debug|info|warn|error)\b/gm }];
      if (keyValPairs && keyValPairs.length) {
        const colon = keyValPairs.filter(key => {
          if (key && key.indexOf('freetext=') === -1) {
            return (key && key.indexOf(':') !== -1);
          }
        });
        if (colon && colon.length) {
          const tagPair = colon[0].split(':');
          this.updateTagNameValue(tagPair[0], tagPair[1]);
        } else {
          keyValPairs.map((data, i) => {
            for (str of validationStr) {
              if (data && data.indexOf(str.title) === 0) {
                this.handleSearch(str, data, i);
                break;
              } else {
                this.validationFalse(false, 'Search text not valid');
              }
            }
          });
        }
      }
    } else if (str === '') {
      this.validationFalse(true, '');
    } else {
      this.validationFalse(false, 'Search text not valid');
    }
  }

  updateTagNameValue(tagName, tagVal): any {
    this.handleTagEv(tagName);
    this.tagName = tagName;
    this.handleTagEv(tagVal);
    this.tagValue = tagVal;
    this.appendTagValues();
  }

  handleTagEv(value: any, index?: number) {
    const regex = /.*?/gi;
    this.handleEvCommonCall(regex, value, index);
  }

  appendTagValues(index?: number) {
    if (!this.tagName || !this.tagValue) {
      this.searchInputValue = '';
      this.validationFalse(false, 'Search text not valid');
    }
    if ((this.tagName === '') && (this.tagValue === '')) {
      this.searchInputValue = '';
      this.displaySearch = '';
    } else {
      this.searchInputValue = this.tagName + ':' + this.tagValue;
    }
  }

  handleSearch(obj, value, index): void {
    const tagValue = value.trim().slice(obj.title.length);
    this.handleEvCommonCall(obj.regex, tagValue, index);
    this.searchInputValue = value;
  }

  validationFalse(isValidSearch, error) {
    this.isValidSearch = isValidSearch;
    this.displaySearch = error;
    // this.onblur.emit({ isValid: this.isValidSearch, display: this.displaySearch, searchInputValue: this.validateString });
  }

  handleEvCommonCall(regex, value, index?: number) {
    let m;
    while ((m = regex.exec(value))) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      m.forEach(() => {
        this.validationResult.splice(index, 1, true);
        if (this.validationResult.indexOf('false') === -1) {
          this.validationFalse(true, 'Valid search string');
        }
      });
    }
    if (!regex.exec(value)) {
      this.validationResult.splice(index, 1, false);
      this.validationFalse(false, 'Search text not valid');
    }
    if (!value) {
      this.displaySearch = '';
      this.validationFalse(true, '');
    }
  }

  createReport() {
    const formOneValue = this.stepOneForm.value;
    const formThreeValue = this.stepThreeForm.value;
    if (formThreeValue?.fromDate && formThreeValue?.toDate) {
      const custom_date = `${this.getDateFormat(formThreeValue?.fromDate)} to ${this.getDateFormat(formThreeValue?.toDate)}`;
      this.selectedTimeFrame = custom_date;
    }
    const archiveData = {
      defaultValue: false,
      description: formOneValue?.reportDescription,
      error: false,
      errorCount: 0,
      id: null,
      items: this.selectedItems,
      name: formOneValue?.reportName,
      searchText: formThreeValue?.searchText,
      timeFrame: this.selectedTimeFrame
    };
    this.archivePakgsService.createArchiveReport(archiveData).subscribe(res => {
      const createArchive = { isClosed: true };
      this.dialogRef.close(createArchive);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  updateReport() {
    const formOneValue = this.stepOneForm.value;
    const formThreeValue = this.stepThreeForm.value;
    if (formThreeValue?.fromDate && formThreeValue?.toDate) {
      const custom_date = `${this.getDateFormat(formThreeValue?.fromDate)} to ${this.getDateFormat(formThreeValue?.toDate)}`;
      this.selectedTimeFrame = custom_date;
    }
    const archiveData = {
      defaultValue: false,
      description: formOneValue?.reportDescription,
      error: false,
      errorCount: 0,
      id: this.dialogData?.id,
      items: this.selectedItems,
      name: formOneValue?.reportName,
      searchText: formThreeValue?.searchText,
      timeFrame: this.selectedTimeFrame
    };
    this.archivePakgsService.editArchiveReport(archiveData).subscribe(res => {
      const createArchive = { isClosed: true };
      this.dialogRef.close(createArchive);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*============== Cancel Request ===============*/
  onCancel() {
    const createArchive = { isClosed: false };
    this.dialogRef.close(createArchive);
  }
  /*============== END Cancel Request ===============*/

}
