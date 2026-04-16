import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Script } from '../../tools';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.scss']
})
export class ScriptComponent implements OnInit {
  @Input() activeTabIndex: number = 0;
  @Output() currentTabIndex: EventEmitter<number> = new EventEmitter<number>();
  activeTab: number = 0;
  workspaceId: number;
  selectedType: number;
  templatesItems = [];
  scriptItems = [];
  searchTemplateStr: string;
  searchScriptStr: string;
  isExportDeployedVersion: boolean = true;

  constructor(
    private fb: UntypedFormBuilder,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService
  ) { }

  ngOnInit(): void {
    this.toolsService.selectedWsAndTypeForExport.subscribe(res => {
      this.workspaceId = res?.workspaceId;
      this.selectedType = res?.typeId;
      this.isExportDeployedVersion = res?.isExportDeployedVersion;
    });
  }

  handleChange(index: number) {
    // const index = e.index;
    if (index === 0) {
      this.currentTabIndex.next(index);
      // this.toolsService.selectedWsAndTypeForExport.subscribe(res => {
      //   if (res?.workspaceId || res?.typeId || res?.exportOption) {
      //     this.workspaceId = res?.workspaceId;
      //     const scriptObj: Script = {
      //       workspaceId: this.workspaceId,
      //       type: 'ALL',
      //       integrationIds: this.toolsDataService.getIntegrationItemIds(),
      //       processIds: this.toolsDataService.getProcessItemIds(),
      //       triggerIds: this.toolsDataService.getTriggerItemIds()
      //     }
      //     this.getScript(scriptObj, res?.typeId, res?.exportOption);
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

  /*=========== Get Script ===========*/
  getScript(workspaceId: number, typeId: number, exportOption: string) {
    const selectedTempIds = this.toolsDataService.getTemplateIds();
    const selectedScriptIds = this.toolsDataService.getScriptIds();
    this.templatesItems = [];
    this.scriptItems = [];
    const scriptObj: Script = {
      workspaceId: workspaceId,
      type: 'ALL',
      integrationIds: this.toolsDataService.getIntegrationItemIds(),
      processIds: this.toolsDataService.getProcessItemIds(),
      triggerIds: this.toolsDataService.getTriggerItemIds(),
      exportDeployedVersion: this.isExportDeployedVersion,
    }
    this.toolsService.getScript(scriptObj).subscribe(res => {
      res.forEach((item) => {
        if (typeId === 1) {
          if (exportOption === 'exportConnected') {
            if (item?.connected) {
              item.disabled = true;
              item.checked = true;
            } else {
              item.disabled = true;
              item.checked = false;
            }
          } else {
            item.disabled = true;
            item.checked = true;
          }
        } else {
          if (item?.connected) {
            item.disabled = true;
            item.checked = true;
          } else {
            item.disabled = false;
            item.checked = false;
            // State mantain
            if (selectedTempIds?.length || selectedScriptIds?.length) {
              item.checked = (selectedTempIds.includes(Number(item?.id)) || selectedScriptIds.includes(Number(item?.id)));
            }
          }
        }
        if (item?.userDefined) {
          this.scriptItems.push(item);
        } else {
          this.templatesItems.push(item);
        }
      });
      this.onTemplateChange();
      this.onScriptChange();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onTemplateChange() {
    this.toolsDataService.storeTemplateIds(this.getTemplateIds());
  }

  onScriptChange() {
    this.toolsDataService.storeScriptIds(this.getScriptIds());
  }

  getTemplateIds() {
    const uniqueTempIds = [];
    if (this.templatesItems?.length) {
      this.templatesItems.forEach(item => {
        if (item?.checked) {
          uniqueTempIds.push(Number(item?.id));
        }
      });
      // this.toolsDataService.storeTemplateIds(uniqueTempIds);
      return uniqueTempIds;
    }
  }

  getScriptIds() {
    const uniqueScriptIds = [];
    if (this.scriptItems?.length) {
      this.scriptItems.forEach(item => {
        if (item?.checked) {
          uniqueScriptIds.push(Number(item?.id));
        }
      });
      // this.toolsDataService.storeScriptIds(uniqueScriptIds);
      return uniqueScriptIds;
    }
  }

}
