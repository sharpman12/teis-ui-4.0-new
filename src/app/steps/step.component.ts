import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Report } from '../core/model/log/Report';
import { Item } from '../core/model/log/Item';
import { first } from 'rxjs/operators';
import { CustomValidator } from '../shared/validation/custom.validation';
import { LogReportService } from '../core/service/logreport.service';
import { LogService } from '../core/service/log.service';
import { TreeNode } from 'primeng/api';
import { HeaderService } from '../core/service/header.service';
import { BreadCrumbService } from '../core/service/breadcrumb.service';
import { Folder } from '../logs/adapters/folders';
import { EditFolder } from '../logs/adapters/editfolders';
import { ItemData } from '../core/model/log/ItemData';
import { Workspace } from '../core/model/log/WorkSpace';
import { Router } from '@angular/router';

@Component({
  selector: 'app-steps',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent implements OnInit, OnDestroy {
  public arrTree: TreeNode[] = [];
  selectedWorkSpaceIds = [];
  activeIndex = 0;
  logReportForm: UntypedFormGroup;
  selectedFiles: TreeNode[] = [];
  selectedFile: any[] = [];
  rangeDates: Date[];
  stepOne: UntypedFormGroup;
  stepTwo: UntypedFormGroup;
  stepThree: UntypedFormGroup;
  public cards: Report[] = [];
  public cardName: string[] = [];
  calenderdisplayString: string;
  loading: boolean;
  public duplicateReport = false;
  public showModal: boolean; // popup
  isFirstPageSubmitted = false;
  clickedCheckBoxIndices = [];
  selectedArrayWSpaces = [];
  selectedArrayItemIds = [];
  selectedItemArray: any[] = [];
  searchTextArea: string;
  firstFormFill = false;
  validEditExpression: boolean = true;
  validEditExpressionValue: string;
  isSubmitted: boolean;
  selectedReportName: string;
  isFmLoading = true;
  /////////////////////////////////////////////////////////////

  inputSearchString: string;

  @Input() showCreateWizard: boolean; // wizard in pop up mode
  @Input() reports: Report; // wizard in pop up mode
  @Input() workSpaces: Item[]; // wizard in pop up mode
  @Input() reportId: number; // wizard in pop up mode
  @Output() readonly closeWizardPopUP: EventEmitter<{}> = new EventEmitter();

  /////////////////////////////////////////////////////////////
  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private logReportService: LogReportService,
    private logService: LogService,
    public header: HeaderService,
    public breadcrumb: BreadCrumbService
  ) { }

  ngOnInit() {
    this.header.show(); // show hide header
    // this.breadcrumb.hide(); // show hide breadcrumb
    if (localStorage.getItem('source') || this.router.url === '/logs') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.getCardNames();

    //  create wizard
    if (this.showCreateWizard === true) {
      this.stepOne = this.fb.group({
        reportName: ['', [Validators.required]],
        reportDescription: [''],
        wSpaces: this.fb.array(
          this.workSpaces.map(() => this.fb.control('')),
          CustomValidator.multipleCheckboxRequireOne
        )
      });
      this.stepTwo = this.fb.group({
      });
      this.stepThree = this.fb.group({
        timeFrame: ['', [Validators.required]],
        editExpression: [''],
        errorOnly: [false]
      });
    } else {//  edit wizard
      const workSpacesId = [];
      this.selectedReportName = this.reports.name;
      if (this.reports.items) {// If workspace are present
        for (let m = 0; m <= this.reports.items.length - 1; m++) {
          this.selectedArrayItemIds.push(this.reports.items[m].workspaceId);
        }
        for (let j = 0; j <= this.workSpaces.length - 1; j++) {
          workSpacesId.push(this.workSpaces[j].id);
        }
        const temp = [...workSpacesId];
        if (this.selectedArrayItemIds.length > 0) {
          for (let i = 0; i <= this.selectedArrayItemIds.length - 1; i++) {
            const checkWorkSpaceAvailability = temp.indexOf(this.selectedArrayItemIds[i].toString());
            if (checkWorkSpaceAvailability !== -1) {
              temp[checkWorkSpaceAvailability] = true;
            }
          }
          /*------ Add this code for fixed workspace checkbox selection ------*/
          temp.forEach((res, i) => {
            if (res !== true) {
              temp[i] = false;
            }
          });
          this.stepOne = this.fb.group({
            reportName: [this.selectedReportName, [Validators.required]],
            reportDescription: [this.reports.description],
            wSpaces: this.fb.array(
              temp.map((v) => this.fb.control(v)),
              CustomValidator.multipleCheckboxRequireOne
            )
          });
        } else {
          this.stepOne = this.fb.group({
            reportName: [this.selectedReportName, [Validators.required]],
            reportDescription: [this.reports.description],
            wSpaces: this.fb.array(
              this.workSpaces.map(() => this.fb.control('')),
              CustomValidator.multipleCheckboxRequireOne
            )
          });
        }
      } else {// If workspace are deleted
        this.stepOne = this.fb.group({
          reportName: [this.selectedReportName, [Validators.required]],
          reportDescription: [this.reports.description],
          wSpaces: this.fb.array(
            this.workSpaces.map(() => this.fb.control('')),
            CustomValidator.multipleCheckboxRequireOne
          )
        });
      }

      this.stepTwo = this.fb.group({
      });
      this.stepThree = this.fb.group({
        timeFrame: [this.reports.timeFrame, [Validators.required]],
        editExpression: [this.reports.searchText],
        errorOnly: [this.reports.error]
      });
    }
  }

  countSeletedNode(nodes, updateSelectedFile: boolean) {
    if (nodes.isSelected === true) {
      if (updateSelectedFile) {
        // Do not update in case of onNodeSelect
        this.selectedFile.push(nodes);
      }
      const newItem = new ItemData(nodes.workspaceId, nodes.id, nodes.nodeType);
      this.checkNode(newItem);
    }
    if (nodes.children !== null) {
      for (let m = 0; m <= nodes.children.length - 1; m++) {
        this.countSeletedNode(nodes.children[m], updateSelectedFile);
      }
    }
  }
  expandChildren(node, workspaceId) { //   keep all child nodes expanded
    let nodeArray: TreeNode;
    nodeArray = new EditFolder(node, workspaceId);
    this.countSeletedNode(nodeArray, true);
    this.checkArrTreeNode(nodeArray);
  }

  processData(index, data): void {
    let nodeArray: TreeNode;
    if (index >= data.length) {
      this.loading = false;
      this.isFmLoading = false;
    } else {
      this.logReportService.getItemTree(data[index], this.reportId).subscribe(
        report => {
          nodeArray = new EditFolder(report, data[index]);
          this.countSeletedNode(nodeArray, true);
          this.checkArrTreeNode(nodeArray);
          this.processData(parseInt(index, 10) + 1, data);
        }, err => {
        });
    }
  }
  stepOneEditNextClick() {
    this.activeIndex = this.activeIndex + 1;
    const selectedWorkSpaceIds = [];
    const selectedWorkSpaceNames = [];
    const calls = [];
    for (let l = 0; l < this.stepOne.value.wSpaces.length; l++) {
      if (this.stepOne.value.wSpaces[l] === true || this.stepOne.value.wSpaces[l] === 'true') {
        calls.push(this.workSpaces[l].id);
        selectedWorkSpaceIds.push(this.workSpaces[l].id);
        selectedWorkSpaceNames.push(this.workSpaces[l].name);
      }
    }
    this.selectedWorkSpaceIds = selectedWorkSpaceIds;
    this.loading = true;

    // Get tree elements for newly selected workspaces
    if (this.isFirstPageSubmitted) {
      for (let count = 0; count <= this.clickedCheckBoxIndices.length - 1; count++) {
        this.processData(this.clickedCheckBoxIndices[count], calls);
      }

      this.removeUnselectedWorkspaces(selectedWorkSpaceNames);
    } else {
      this.processData(0, calls);
      this.isFirstPageSubmitted = true;
    }
    this.loading = false;
    this.clickedCheckBoxIndices = [];
  }

  // Remove unselected workspaces from arrTree
  private removeUnselectedWorkspaces(selectedWorkSpaceNames: any[]) {
    const tempData = [];
    for (let l = 0; l < this.arrTree.length; l++) {
      if (selectedWorkSpaceNames.includes(this.arrTree[l].label)) {
        tempData.push(this.arrTree[l]);
      }
    }
    this.arrTree = tempData;
  }

  // Called on workspaces checkbox click on first page of edit wizard
  onchangeCheckbox(event: any) {// Get clicked checkbox indices
    this.clickedCheckBoxIndices.push(event.target.id.substring(event.target.id.length - 1));
  }

  nextStepHandle(val) {
    this.firstFormFill = true;
    this.activeIndex = this.activeIndex + 1;
    const selectedWorkSpaceIds = this.stepOne.value.wSpaces
      .map((v, i) => v ? this.workSpaces[i].id : null)
      .filter(v => v !== null);
    const selectedWorkSpaceNames = this.stepOne.value.wSpaces
      .map((v, i) => v ? this.workSpaces[i].name : null)
      .filter(v => v !== null);
    this.selectedWorkSpaceIds = selectedWorkSpaceIds;
    this.getItemsByFolderId(selectedWorkSpaceIds, selectedWorkSpaceNames);
    if (this.stepOne.invalid) {
      return;
    }
  }


  getCardNames() {
    this.logService.getCards()
      .subscribe(
        cards => {
          this.cards = cards;
          this.cards.map((cName) => {
            this.cardName.push(cName.name);
          });
        });
  }


  get fthree() { return this.stepThree.controls; }
  get fOne() { return this.stepOne.controls; }
  get fTwo() { return this.stepTwo.controls; }

  getItemsByFolderId(selectedCheckBoxid, selectedWorkSpaceNames) {
    this.arrTree = [];
    for (let j = 0; j <= selectedCheckBoxid.length - 1; j++) {
      const selectedWorkspace = new Workspace(
        selectedWorkSpaceNames[j],
        selectedCheckBoxid[j],
        'WORKSPACE'
      );

      const temp: TreeNode = new Folder(selectedWorkspace, selectedCheckBoxid[j]);
      temp.children = [];
      this.checkArrTreeNode(temp);
    }
  }

  // Checks if node is already present in arrTree
  private checkArrTreeNode(temp) {
    this.isFmLoading = true;
    if (this.arrTree.length > 0) {
      let found = false;
      for (let count = 0; count <= this.arrTree.length - 1; count++) {
        if (this.arrTree[count].label === temp.label) {
          found = true;
          break;
        }
      }

      if (!found) {
        this.arrTree.push(temp);
        // this.isFmLoading = false;
      }
    } else {
      this.arrTree.push(temp);
      // this.isFmLoading = false;
    }
  }

  onNodeSelect($event) {
    const node = $event.node;
    const tempdata = [...this.selectedItemArray];

    if (node.nodeType === 'WORKSPACE') {
      for (let i = 0; i < this.selectedItemArray.length; i++) {
        if (this.selectedItemArray[i].itemType !== 'WORKSPACE' && this.selectedItemArray[i].workspaceId === node.workspaceId) {
          const index = tempdata.indexOf(this.selectedItemArray[i], 0);
          if (index > -1) {
            tempdata.splice(index, 1);
          }
        }
      }
    }
    this.selectedItemArray = tempdata;
    if (node.nodeType === 'FOLDER') {
      // Set children as selected from folder
      this.setChildrenAsSelected(node);
      this.countSeletedNode(node, false);
    } else {
      const newItem = new ItemData(node.workspaceId, node.id, node.nodeType);
      this.checkNode(newItem);
    }
  }

  // Checks if item is already present in selected items list
  private checkNode(newItem) {
    if (this.selectedItemArray.length > 0) {
      let found = false;
      for (let count = 0; count <= this.selectedItemArray.length - 1; count++) {
        if (this.selectedItemArray[count].itemId === newItem.itemId) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.selectedItemArray.push(newItem);
      }
    } else {
      this.selectedItemArray.push(newItem);
    }
  }

  private setChildrenAsSelected(node: any) {
    node.isSelected = true;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setChildrenAsSelected(node.children[m]);
      }
    }
  }

  onNodeDeSelect($event) {
    const node = $event.node;
    this.selectedItemArray = [];

    if (this.selectedFile.length > 0) {
      for (let g = 0; g <= this.selectedFile.length - 1; g++) {
        if (this.selectedFile[g].data !== '') {
          const newItem = new ItemData(this.selectedFile[g].workspaceId, this.selectedFile[g].id, this.selectedFile[g].nodeType);
          this.selectedItemArray.push(newItem);
        } else {
          this.selectedItemArray = [];
        }
      }
    }
  }

  public getChildNode($event): void {
    const node = $event.node;
    const nodeid = node.id;
    let nodeselected: boolean;
    const selectedNode = this.selectedFile.findIndex(x => x === node);
    if (selectedNode !== -1) {
      nodeselected = true;
    } else {
      nodeselected = false;
    }

    if (node.nodeType === 'WORKSPACE' && node.children.length === 0) {
      this.logReportService.getItemTreeByWorkspace(nodeid, nodeselected)
        .subscribe(
          resp => {
            const childNodes = resp.children;
            for (let k = 0; k <= childNodes.length - 1; k++) {
              node.children.push(new EditFolder(childNodes[k], node.workspaceId, false));
            }
            this.setChildrenAsSelected(node);
            this.countSeletedNode(node, true);
          });
    }
  }

  previousStep() {
    this.activeIndex = this.activeIndex - 1;
  }
  nextStep() {
    this.activeIndex = this.activeIndex + 1;
  }
  cancelWizard() {
    this.closeWizardPopUP.emit({ status: false });
  }
  previousPageCreateReport() {
    this.closeWizardPopUP.emit({ status: false });
  }
  previousPageStepOne() {
    this.activeIndex = this.activeIndex - 1;
  }
  previousPage() {
    if (this.stepOne.dirty === true) {
      this.showModal = true;
    } else {
      this.showModal = false;
      this.closeWizardPopUP.emit({ status: false });
    }
  }
  saveUpdatedReport() {
    this.showModal = false;
  }
  hide() {
    this.showModal = false; // Show-Hide Modal Check
  }
  resetAllForms() {
    this.stepOne.reset();
    this.stepTwo.reset();
    this.stepThree.reset();
  }
  cancelUpdatedReport() {
    this.showModal = false;
    this.closeWizardPopUP.emit({ status: false });
  }
  countInArray(array: ItemData[], workspaceID) {
    let count = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i].workspaceId === workspaceID) {
        count++;
      }
    }
    return count;
  }


  editWizard() {
    const selectedItems: any[] = this.createFinalSelectedArray();

    let searchText: string;
    if (this.validEditExpressionValue) {
      searchText = this.validEditExpressionValue;
    } else {
      searchText = this.reports.searchText;
    }
    this.logReportService.updateReport(new Report(
      this.reportId,
      this.stepOne.controls.reportName.value,
      this.stepOne.controls.reportDescription.value,
      searchText,
      this.stepThree.controls.timeFrame.value,
      0,
      this.stepThree.controls.errorOnly.value,
      selectedItems, // itemmap
      false
    )).pipe(first())
      .subscribe(
        report => {
          this.closeWizardPopUP.emit({
            status: false, name: this.stepOne.controls.reportName.value,
            description: this.stepOne.controls.reportDescription.value, searchText: searchText,
            timeFrame: this.stepThree.controls.timeFrame.value, errorOnly: this.stepThree.controls.errorOnly.value,
            id: this.reportId, details: 'Log Updated Successfully!'
          });
        });
  }

  private createFinalSelectedArray() {
    const selectedItems: any[] = [];

    for (let i = 0; i < this.selectedItemArray.length; i++) {
      if (this.selectedItemArray[i].itemType !== 'WORKSPACE') {
        selectedItems.push(this.selectedItemArray[i]);
      } else if (this.selectedItemArray[i].itemType === 'WORKSPACE') {
        const check = this.countInArray(this.selectedItemArray, this.selectedItemArray[i].workspaceId);
        if (check === 1) {
          selectedItems.push(this.selectedItemArray[i]);
        }
      }
    }
    return selectedItems;
  }

  createWizard() {
    this.isSubmitted = true;
    const selectedItems: any[] = this.createFinalSelectedArray();
    let searchText: string;
    searchText = this.validEditExpressionValue;
    this.logReportService.createReport(new Report(
      null,
      this.stepOne.controls.reportName.value,
      this.stepOne.controls.reportDescription.value,
      searchText,
      this.stepThree.controls.timeFrame.value,
      0,
      this.stepThree.controls.errorOnly.value,
      selectedItems, // map
      false
    ))
      .subscribe(
        report => {
          this.closeWizardPopUP.emit({ status: false, name: this.stepOne.controls.reportName.value, details: 'Log created Successfully!' });
        });

  }

  closePopUp(value) {
    this.logReportForm.get('searchText').setValue(value);
  }

  ngOnDestroy() {
    this.selectedFile = [];
  }
  ////////////////////////////////////////////////
  // service related
  ////////////////////////////////////////////////
  onReportNameBlur($event) {
    const reportName = $event.target.value;
    if (this.selectedReportName !== reportName && this.cardName.indexOf(reportName.trim()) > -1) {
      this.duplicateReport = true;
    } else {
      this.duplicateReport = false;
    }
  }

  onReportNameKeydown($event) {
    // Hide duplicate error message while changing report name
    this.duplicateReport = false;
  }

  onTimeFrameBlur($event) {
    if ($event.isValid) {
      this.stepThree.controls['timeFrame'].setErrors({ 'valid': null });
      this.stepThree.controls['timeFrame'].updateValueAndValidity();
    } else {
      this.stepThree.controls['timeFrame'].setErrors({ 'valid': false });
    }
  }
  getInputSearchString($event) {
    this.inputSearchString = $event;
  }
  onEditExpressionBlur($event) {
    this.validEditExpression = $event.isValid;
    if (this.validEditExpression === true) {
      this.validEditExpressionValue = $event.searchInputValue;
    }

    if ($event.isValid) {
      this.stepThree.controls['editExpression'].setErrors({ 'valid': null });
      this.stepThree.controls['editExpression'].updateValueAndValidity();
    } else {
      this.stepThree.controls['editExpression'].setErrors({ 'valid': false });
    }
  }
}


