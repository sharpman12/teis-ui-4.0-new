import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {
  @Input() activeTabIndex: number = 0;
  @Output() currentTabIndex: EventEmitter<number> = new EventEmitter<number>();
  activeTab: number = 0;
  globalParameters = [];
  applicationParameters = [];
  searchGlobalParamsStr: string;
  searchAppParamsStr: string;
  workspaceId: number;
  selectedType: number;

  constructor(
    private fb: UntypedFormBuilder,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService
  ) { }

  ngOnInit(): void {
    this.toolsService.selectedWsAndTypeForExport.subscribe(res => {
      this.workspaceId = res?.workspaceId;
      this.selectedType = res?.typeId;
    });
  }

  handleChange(index: number) {
    // const index = e.index;
    if (index === 0) {
      this.currentTabIndex.next(index);
      // this.toolsService.selectedWsAndTypeForExport.subscribe(res => {
      //   if (res?.workspaceId || res?.typeId) {
      //     this.getGlobalParameter(res?.workspaceId, res?.typeId);
      //     this.getApplicationParameter(res?.workspaceId, res?.typeId);
      //   }
      // });
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
    }
  }

  /*=========== Set Tab Index ===========*/
  setTabIndex(index: number, nextTab: boolean, prevTab: boolean) {
    this.activeTab = index;
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
    }
  }
  /*=========== END Set Tab Index ===========*/

  /*=========== Get Global Script Parameters ============*/
  getGlobalParameter(workspaceId: number, exportType: number) {
    const selectedGlobalParamsIds = this.toolsDataService.getGlobalParamsIds();
    this.toolsService.getScriptParams(workspaceId, 'globalParam').subscribe(res => {
      res.forEach(item => {
        if (exportType === 1) {
          item.disabled = true;
          item.checked = true;
        } else {
          item.disabled = false;
          item.checked = false;
          if (selectedGlobalParamsIds?.length) {
            item.checked = selectedGlobalParamsIds.includes(Number(item?.id));
          }
        }
      });
      this.globalParameters = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Get Global Script Parameters ============*/

  /*=========== Get Global Script Parameters ============*/
  getApplicationParameter(workspaceId: number, exportType: number) {
    const selectedAppParamsIds = this.toolsDataService.getAppParamsIds();
    this.toolsService.getScriptParams(workspaceId, 'applicationParam').subscribe(res => {
      res.forEach(item => {
        if (exportType === 1) {
          item.disabled = true;
          item.checked = false;
        } else {
          item.disabled = false;
          item.checked = false;
          if (selectedAppParamsIds?.length) {
            item.checked = selectedAppParamsIds.includes(Number(item?.id));
          }
        }
      });
      this.applicationParameters = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Get Global Script Parameters ============*/

  onGlobalParamChange() {
    this.toolsDataService.storeGlobalParamsIds(this.getGlobalParamsIds());
  }

  onAppParamChange() {
    this.toolsDataService.storeAppParamsIds(this.getAppParamsIds());
  }

  getGlobalParamsIds() {
    const globalParamsIds = [];
    if (this.globalParameters?.length) {
      this.globalParameters.forEach(item => {
        if (item?.checked) {
          globalParamsIds.push(Number(item?.id));
        }
      });
      // this.toolsDataService.storeGlobalParamsIds(globalParamsIds);
      return globalParamsIds;
    }
  }

  getAppParamsIds() {
    const appParamsIds = [];
    if (this.applicationParameters?.length) {
      this.applicationParameters.forEach(item => {
        if (item?.checked) {
          appParamsIds.push(Number(item?.id));
        }
      });
      // this.toolsDataService.storeAppParamsIds(appParamsIds);
      return appParamsIds;
    }
  }

}
