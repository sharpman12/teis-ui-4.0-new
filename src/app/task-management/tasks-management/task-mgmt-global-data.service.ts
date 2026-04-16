import { Injectable } from '@angular/core';
import { TaskItemsListDto } from './task-mgmt';

@Injectable({
  providedIn: 'root'
})
export class TaskMgmtGlobalDataService {

  /*---------- Workspace Tree Properties ---------- */
  private workspaceTreeArr: Array<any> = [];

  /*---------- Task Item Lists Properties ---------- */
  private taskItemsList: Array<TaskItemsListDto> = [];

  /*---------- Task Details Properties ---------- */
  private taskDetailsArr: Array<any> = [];

  /*---------- General Information Properties ---------- */
  private integrationByIdArr: Array<any> = [];
  private processByIdArr: Array<any> = [];
  private integrationProcessByIdArr: Array<any> = [];
  private triggerByIdArr: Array<any> = [];
  private integrationTriggerByIdArr: Array<any> = [];

  /*---------- Service Logs Properties ---------- */
  private serviceLogArr: Array<any> = [];

  /*---------- Event Logs Properties ---------- */
  private eventLogArr: Array<any> = [];

  private parameterSettingData: any = null;
  
  constructor() { }

  /*---------- Workspace Tree Methods ---------- */
  storeWorkspaceTree(workspaceTreeDto: any) {
    const foundIndex = this.workspaceTreeArr.findIndex(x => (Number(x.workspaceId) === Number(workspaceTreeDto?.workspaceTree?.id) && (x?.taskType.toLowerCase() === workspaceTreeDto?.taskType.toLowerCase())));
    if (foundIndex > -1) {
      this.workspaceTreeArr[foundIndex] = workspaceTreeDto;
    } else {
      this.workspaceTreeArr.push(workspaceTreeDto);
    }
  }

  getWorkspaceTreeById(workspaceIds: Array<number>, taskType: string) {
    let workspaceTreeByIdArr = [];
    if (workspaceIds?.length && this.workspaceTreeArr?.length) {
      workspaceIds.forEach(wsId => {
        this.workspaceTreeArr.forEach(item => {
          if (
            Number(wsId) === Number(item?.workspaceId) &&
            (taskType.toLowerCase() === item?.taskType.toLowerCase())
          ) {
            workspaceTreeByIdArr.push(item?.workspaceTree);
          }
        });
      });
    }
    return workspaceTreeByIdArr;
  }

  clearWorkspaceTree() {
    this.workspaceTreeArr = [];
  }
  /*---------- END Workspace Tree Methods ---------- */

  /*---------- Store, Get and Clear Task Item Lists Methods ---------- */
  storeTaskItemsList(taskItemListDto: TaskItemsListDto) {
    const foundIndex = this.taskItemsList.findIndex(x => Number(x.itemId) === Number(taskItemListDto.itemId));
    if (foundIndex > -1) {
      this.taskItemsList[foundIndex] = taskItemListDto;
    } else {
      this.taskItemsList.push(taskItemListDto);
    }
  }

  getTaskItemsList(id: number, taskType: string) {
    let taskItemListById = null;
    if (this.taskItemsList?.length) {
      taskItemListById = this.taskItemsList.find(obj => ((Number(obj?.itemId) === Number(id)) && (obj?.taskType.toLowerCase() === taskType.toLowerCase())));
    }
    return taskItemListById;
  }

  clearTaskItemsList() {
    this.taskItemsList = [];
  }
  /*---------- END Store, Get and Clear Task Item Lists Methods ---------- */

  /*---------- Store, Get and Clear Task Details Methods ---------- */
  storeTaskDetails(taskDetails: any) {
    this.taskDetailsArr.push(taskDetails);
  }

  getStoreTaskDetails() {
    return this.taskDetailsArr;
  }

  clearTaskDetailsArr(taskId: string, taskType: string) {
    if (taskType === 'All') {
      this.taskDetailsArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeDetailsById = this.taskDetailsArr.findIndex((obj) => ((obj?.TaskId?.value === taskId) || (obj?.TaskIdentity?.value === taskId)));
      if (removeDetailsById > -1) {
        this.taskDetailsArr.splice(removeDetailsById, 1);
      }
    }
  }
  /*---------- END Store, Get and Clear Task Details Methods ---------- */

  /*---------- Store, Get and Clear General Information IntegrationById Methods ---------- */
  storeIntegrationById(integrationDetailsDto: any) {
    const foundIndex = this.integrationByIdArr.findIndex(x => x.integrationId == integrationDetailsDto.integrationId);
    if (foundIndex > -1) {
      this.integrationByIdArr[foundIndex] = integrationDetailsDto;
    } else {
      this.integrationByIdArr.push(integrationDetailsDto);
    }
  }

  getIntegrationById(integrationId: number) {
    let integrationById = null;
    if (this.integrationByIdArr?.length) {
      integrationById = this.integrationByIdArr.find(obj => Number(obj?.integrationId) === Number(integrationId));
    }
    return integrationById;
  }

  clearIntegrationById(integrationId: number, taskType: string) {
    if (taskType === 'All') {
      this.integrationByIdArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeIntegrationById = this.integrationByIdArr.findIndex((obj) => Number(obj?.integrationId) === Number(integrationId));
      if (removeIntegrationById > -1) {
        this.integrationByIdArr.splice(removeIntegrationById, 1);
      }
    }
  }
  /*---------- END Store, Get and Clear General Information IntegrationById Methods ---------- */

  /*---------- Store, Get and Clear General Information ProcessById Methods ---------- */
  storeProcessById(processDetailsDto: any) {
    const foundIndex = this.processByIdArr.findIndex(x => x.processId == processDetailsDto.processId);
    if (foundIndex !== -1) {
      this.processByIdArr[foundIndex] = processDetailsDto;
    } else {
      this.processByIdArr.push(processDetailsDto);
    }
  }

  getProcessById(processId: number) {
    let processById = null;
    if (this.processByIdArr?.length) {
      processById = this.processByIdArr.find(obj => Number(obj?.processId) === Number(processId));
    }
    return processById;
  }

  clearProcessById(processId: number, taskType: string) {
    if (taskType === 'All') {
      this.processByIdArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeProcessById = this.processByIdArr.findIndex((obj) => Number(obj?.processId) === Number(processId));
      if (removeProcessById > -1) {
        this.processByIdArr.splice(removeProcessById, 1);
      }
    }
  }
  /*---------- END Store, Get and Clear General Information ProcessById Methods ---------- */

  /*---------- Store, Get and Clear General Information IntegrationProcessById Methods ---------- */
  storeIntegrationProcessById(integrationProcessDto: any) {
    const foundIndex = this.integrationProcessByIdArr.findIndex(x => x.processId == integrationProcessDto.processId);
    if (foundIndex !== -1) {
      this.integrationProcessByIdArr[foundIndex] = integrationProcessDto;
    } else {
      this.integrationProcessByIdArr.push(integrationProcessDto);
    }
  }

  getIntegrationProcessById(workspaceId: number, processId: number) {
    let integrationProcessById = null;
    if (this.integrationProcessByIdArr?.length) {
      integrationProcessById = this.integrationProcessByIdArr.find(obj => ((Number(obj?.workspaceId) === Number(workspaceId)) && (Number(obj?.processId) === Number(processId))));
    }
    return integrationProcessById;
  }

  clearIntegrationProcessById(workspaceId: number, processId: number, taskType: string) {
    if (taskType === 'All') {
      this.integrationProcessByIdArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeIntegrationProcessById = this.integrationProcessByIdArr.findIndex((obj) => ((Number(obj?.workspaceId) === Number(workspaceId)) && (Number(obj?.processId) === Number(processId))));
      if (removeIntegrationProcessById > -1) {
        this.integrationProcessByIdArr.splice(removeIntegrationProcessById, 1);
      }
    }
  }
  /*---------- END Store, Get and Clear General Information IntegrationProcessById Methods ---------- */

  /*---------- Store, Get and Clear General Information TriggerById Methods ---------- */
  storeTriggerById(triggerDetailsDto: any) {
    const foundIndex = this.triggerByIdArr.findIndex(x => x.triggerId == triggerDetailsDto.triggerId);
    if (foundIndex !== -1) {
      this.triggerByIdArr[foundIndex] = triggerDetailsDto;
    } else {
      this.triggerByIdArr.push(triggerDetailsDto);
    }
  }

  getTriggerById(triggerId: number) {
    let triggerById = null;
    if (this.triggerByIdArr?.length) {
      triggerById = this.triggerByIdArr.find(obj => Number(obj?.triggerId) === Number(triggerId));
    }
    return triggerById;
  }

  clearTriggerById(triggerId: number, taskType: string) {
    if (taskType === 'All') {
      this.triggerByIdArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeTriggerById = this.triggerByIdArr.findIndex((obj) => Number(obj?.triggerId) === Number(triggerId));
      if (removeTriggerById > -1) {
        this.processByIdArr.splice(removeTriggerById, 1);
      }
    }
  }
  /*---------- END Store, Get and Clear General Information TriggerById Methods ---------- */

  /*---------- Store, Get and Clear General Information IntegrationTriggerById Methods ---------- */
  storeIntegrationTriggerById(integrationTriggerDto: any) {
    const foundIndex = this.integrationTriggerByIdArr.findIndex(x => x.triggerId == integrationTriggerDto.triggerId);
    if (foundIndex !== -1) {
      this.integrationTriggerByIdArr[foundIndex] = integrationTriggerDto;
    } else {
      this.integrationTriggerByIdArr.push(integrationTriggerDto);
    }
  }

  getIntegrationTriggerById(workspaceId: number, triggerId: number) {
    let integrationTriggerById = null;
    if (this.integrationTriggerByIdArr?.length) {
      integrationTriggerById = this.integrationTriggerByIdArr.find(obj => ((Number(obj?.workspaceId) === Number(workspaceId)) && (Number(obj?.triggerId) === Number(triggerId))));
    }
    return integrationTriggerById;
  }

  clearIntegrationTriggerById(workspaceId: number, triggerId: number, taskType: string) {
    if (taskType === 'All') {
      this.integrationTriggerByIdArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeIntegrationTriggerById = this.integrationTriggerByIdArr.findIndex((obj) => ((Number(obj?.workspaceId) === Number(workspaceId)) && (Number(obj?.triggerId) === Number(triggerId))));
      if (removeIntegrationTriggerById > -1) {
        this.integrationTriggerByIdArr.splice(removeIntegrationTriggerById, 1);
      }
    }
  }
  /*---------- END Store, Get and Clear General Information IntegrationTriggerById Methods ---------- */

  /*---------- Service Logs Methods ---------- */
  storeServiceLogs(serviceLogsDto: any) {
    const foundIndex = this.serviceLogArr.findIndex(x => x.taskId === serviceLogsDto.taskId);
    if (foundIndex !== -1) {
      this.serviceLogArr[foundIndex] = serviceLogsDto;
    } else {
      this.serviceLogArr.push(serviceLogsDto);
    }
  }

  getServiceLogsByTaskId(taskId: string) {
    let serviceLogByTaskId = null;
    if (this.serviceLogArr?.length) {
      serviceLogByTaskId = this.serviceLogArr.find(obj => obj?.taskId === taskId);
    }
    return serviceLogByTaskId;
  }

  clearServiceLogs(taskId: string, taskType: string) {
    if (taskType === 'All') {
      this.serviceLogArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeServiceLogByTaskId = this.serviceLogArr.findIndex((obj) => obj?.taskId === taskId);
      if (removeServiceLogByTaskId > -1) {
        this.serviceLogArr.splice(removeServiceLogByTaskId, 1);
      }
    }
  }
  /*---------- END Service Logs Methods ---------- */

  /*---------- Event Logs Methods ---------- */
  storeEventLogs(eventLogsDto: any) {
    const foundIndex = this.eventLogArr.findIndex(x => x.taskId === eventLogsDto.taskId);
    if (foundIndex !== -1) {
      this.eventLogArr[foundIndex] = eventLogsDto;
    } else {
      this.eventLogArr.push(eventLogsDto);
    }
  }

  getEventLogsByTaskId(taskId: string) {
    let eventLogByTaskId = null;
    if (this.eventLogArr?.length) {
      eventLogByTaskId = this.eventLogArr.find(obj => obj?.taskId === taskId);
    }
    return eventLogByTaskId;
  }

  clearEventLogs(taskId: string, taskType: string) {
    if (taskType === 'All') {
      this.eventLogArr = [];
    }
    if (taskType === 'Failed' || taskType === 'Running' || taskType === 'Hold') {
      const removeEventLogByTaskId = this.eventLogArr.findIndex((obj) => obj?.taskId === taskId);
      if (removeEventLogByTaskId > -1) {
        this.eventLogArr.splice(removeEventLogByTaskId, 1);
      }
    }
  }
  /*---------- END Event Logs Methods ---------- */

  /*============= Store Parameter Settings Methods =============*/
  storeParameterSettings(parametersSetting: any) {
    this.parameterSettingData = null;
    this.parameterSettingData = parametersSetting;
  }

  getParameterSettings() {
    return this.parameterSettingData;
  }

  clearParameterSettings() {
    this.parameterSettingData = null;
  }

}
