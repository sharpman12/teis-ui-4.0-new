import { Injectable } from '@angular/core';
import { AlertProcess, AppliedFilters, ScriptDto, GlobalParameter, LogMaintenance, NetUser, QueueGroup, ScriptEngineGroup, Workspace, StoreServcieLogsDto, StoreEventLogsDto, SchedulerDto, NonSchedulerDto, BusinessFlowDto } from './appintegration';
import { WebFlow } from 'src/app/business-management/business-mgmt/businessmgmt';
import { BehaviorSubject } from 'rxjs';

const COMMON_KEY = 'commonFormData';
const SERVICE_LOG_KEY = 'serviceLogStateGroup';
const EVENT_LOG_KEY = 'eventLogStateGroup';

@Injectable({
  providedIn: 'root'
})
export class AppIntegrationDataService {

  /*============= All Workspaces Properties =============*/
  private workspaces: Array<Workspace> = [];

  /*============== Store Selected Worksapce Id ==============*/
  private selectedWorkspaceId = null;

  /*============= All Net Users Properties =============*/
  private netUsers = [];

  /*============= All Global Parameter Properties =============*/
  private globalParameters = [];

  /*============= Integration Properties =============*/
  private integrationItemTree = [];

  /*============= Process Properties =============*/
  private processItemTree = [];

  /*============= Trigger Properties =============*/
  private triggerItemTree = [];

  /*============= Process Tree Item Details Properties =============*/
  private processTreeItemDetails = [];

  /*============= Integration By Process Id Properties =============*/
  private integrationByProcessId = [];

  /*============= Service Log Properties =============*/
  private serviceLogArr: Array<any> = [];

  /*============= Event Log Properties =============*/
  private eventLogArr: Array<any> = [];

  /*============= PIT Tab Index =============*/
  private integrationTabIndex: number = 0;
  private processTabIndex: number = 0;
  private triggerTabIndex: number = 0;

  /*============= Net Users Executables Properties =============*/
  private netUsersExecutables = [];

  /*============= Process Executables Properties =============*/
  private processExecutables: Array<ScriptDto> = [];

  /*============= Deleted Process Executables Properties =============*/
  private deletedProcessExecutables: Array<ScriptDto> = [];

  /*============= Log Maintenance Config Properties =============*/
  private logMaintenanceConfig: Array<LogMaintenance> = [];

  /*============= Alert Process Properties =============*/
  private alertProcesses: Array<AlertProcess> = [];

  /*============== Store Selected Web Service Tree Item Properties ==============*/
  private identifiers = [];

  /*============= SE Groups Properties =============*/
  private scriptEngineGroups: Array<ScriptEngineGroup> = [];

  /*============= Queue Groups Properties =============*/
  private queueGroups: Array<QueueGroup> = [];

  /*============== Store Current Parameters Data For Back and Forth Properties ==============*/
  private currentParamertersData = [];

  /*============== Store Process Parameters Data ==============*/

  private processParamertersData = []

  /*============== Store Current Trigger Config Parameters Data For Back and Forth Properties ==============*/
  private currentTriggerConfigParamertersData = [];

  /*============== Store Version History Properties ==============*/
  private versionHistory = [];

  /*============== Store Selected Process Tree Item Properties ==============*/
  private selectedProcessItem = null;

  /*============== Store Selected Process Item Id Properties ==============*/
  private selectedProcessId = null;

  /*============== Store Selected Integration Tree Item Properties ==============*/
  private selectedInegrationItem = null;

  /*============== Store Selected Integration Item Id Properties ==============*/
  private selectedInegrationId = null;

  /*============== Store Selected Trigger Tree Item Properties ==============*/
  private selectedTriggerItem = null;

  /*============== Store Selected Web Service Tree Item Properties ==============*/
  private selectedWebServiceItem = null;

  /*============== Store Expanded PIT Tree Properties ==============*/
  private expandedTree = [];
  private expandedIntegrationTree = [];
  private expandedTriggerTree = [];

  /*============== Store PIT General Form Data Properties ==============*/
  private pitGeneralFormData = null;

  /*============== Store Connected Process Data In Create Integration Properties ==============*/
  private connectedProcessToIntegration: Array<any> = [];

  /*============= Store Scheduler Properties =============*/
  private schedulersArr: Array<SchedulerDto> = [];

  /*============== Store Deployed Associated Process ==============*/
  private associatedProcess = null;

  /*============== Store Deployed Executable Process ==============*/
  private deployedProcessExecutable = null;

  /*============== Store Integration Search Item ==============*/
  private searchIntItem = '';

  /*============== Store Process Search Item ==============*/
  private searchProcessItem = '';

  private intTreeItemCount = null;

  private processTreeItemCount = null;

  private triggerTreeItemCount = null;

  /*============== Store Trigger Search Item ==============*/
  private searchTriggerItem = '';

  /*============= Main Page applied filters Data Properties =============*/
  private appliedFilters: AppliedFilters = {
    selectedWorkspace: 1,
    currentTab: 0,
    searchTerm: '',
    undeployed: true,
    locked: false,
    disabled: false
  };

  /*============= Store Business Properties =============*/
  private businessFlowArr: any = [];

  private allWebFlowData: any = [];

  private selectedBusiFlowIntegration: any;

  /*============= Store Business Attached Integartion  =============*/
  private businessAttachedIntegartion: any;

  private selectedInegrationFilter: any = [];
  private integrationFilter: any = [];

  private selectedProcessFilter: any = [];
  private processFilter: any = [];

  private selectedTriggerFilter: any = [];
  private triggerFilter: any = [];

  private selectedWebServiceFilter: any = [];

  private selectedScriptId: any = '';

  private selectedProcessObj: any = [];

  private parameterSettingData: any = null;

  private _commonData$ = new BehaviorSubject<any>(this.loadFromStorage(COMMON_KEY));
  commonData$ = this._commonData$.asObservable();

  constructor() { }

  updateCommonData(data: any) {
    this._commonData$.next(data);
    localStorage.setItem(COMMON_KEY, JSON.stringify(data));
  }

  loadFromStorage(key: string) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  saveToStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  clearAll() {
    localStorage.removeItem(COMMON_KEY);
    localStorage.removeItem(SERVICE_LOG_KEY);
    localStorage.removeItem(EVENT_LOG_KEY);
    this._commonData$.next(null);
  }

  /*============= Store Scheduler Methods =============*/
  storeSchedulers(schedulerDto: SchedulerDto, isNewAdd: boolean) {
    schedulerDto.alarmDisable = true;
    if (isNewAdd) {
      this.schedulersArr.push(schedulerDto);
      this.schedulersArr.map((x, i) => x.id = x?.isNew ? i + 1 : x.id);
    } else {
      this.schedulersArr.push(schedulerDto);
    }
  }

  // Validate Scheduler Name
  validateSchedulerName(name: string) {
    return this.schedulersArr.some((x) => x?.schedulerName === name);
  }

  // Get Scheduler Array Length for Genrate Id
  getSchedulerArrLength() {
    return this.schedulersArr?.length;
  }

  getSchedulers(): Array<SchedulerDto> {
    const uniqueSchedulerArray = this.schedulersArr.filter((obj, index, self) =>
      index === self.findIndex((o) => JSON.stringify(o) === JSON.stringify(obj))
    );
    return uniqueSchedulerArray;
  }

  enabledDisabledSchedulers(isDisable: boolean) {
    if (this.schedulersArr?.length) {
      this.schedulersArr.forEach((x) => {
        x.disable = isDisable;
        x.alarmDisable = isDisable;
        x.isEventDisabled = isDisable;
      });
    }
  }

  enabledDisabledSingleSchedulers(scheduler: SchedulerDto, isDisable: boolean) {
    if (this.schedulersArr?.length) {
      const index = this.schedulersArr.findIndex(x => Number(x?.id) === Number(scheduler?.id));
      if (index !== -1) {
        this.schedulersArr[index].isEventDisabled = isDisable;
      }
    }
  }

  getSchedulerById(id: number): SchedulerDto {
    if (this.schedulersArr?.length) {
      const scheduler = this.schedulersArr.find((item) => Number(item.id) === Number(id));
      return scheduler;
    } else {
      return null;
    }
  }

  updateNonScheduler(nonSchedulerDto: any) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const startDate = new Date(nonSchedulerDto?.start);
    const day = startDate?.getDate();
    const month = startDate?.getMonth() + 1;
    const year = startDate?.getFullYear();
    const nonScheduler: NonSchedulerDto = {
      id: null,
      year: year,
      month: month,
      dayOfMonth: day,
      dayOfWeek: null,
      updatedBy: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      lastUpdated: '',
    };
    const scheduler = this.getSchedulerById(Number(nonSchedulerDto?.id));
    scheduler?.nonSchedulerDataList.push(nonScheduler);
    return this.schedulersArr;
  }

  updateSchedulerById(schedulerDto: SchedulerDto) {
    if (this.schedulersArr?.length) {
      let index = this.schedulersArr.findIndex(x => Number(x?.id) === Number(schedulerDto?.id));
      if (index !== -1) {
        this.schedulersArr[index] = schedulerDto;
      }
      return this.schedulersArr;
    }
    return [];
  }

  deleteSchedulerById(schedulerId: number) {
    if (this.schedulersArr?.length) {
      const index = this.schedulersArr.findIndex(item => Number(item.id) === Number(schedulerId));

      if (index !== -1) {
        this.schedulersArr.splice(index, 1);
        return this.schedulersArr;
      }
    }
  }

  clearSchedulers() {
    this.schedulersArr = [];
  }
  /*============= END Store Scheduler Methods =============*/


  /*============= Store BusinessFlows By WebFlowId =============*/
  storebusinessFlowsByWebFlowId(BusinessFlowDto: BusinessFlowDto[]) {
    if (!BusinessFlowDto || BusinessFlowDto.length === 0) {
      this.businessFlowArr = {};
      return;
    }
    const groupedData = BusinessFlowDto.reduce((data, item) => {
      const id = item.webFlowData.id;
      if (!data[id]) {
        data[id] = [];
      }
      data[id].push(item);

      return data;
    }, {} as Record<number, BusinessFlowDto[]>);
    this.businessFlowArr = groupedData;
  }

  /*============= Get BusinessFlows by WebFlowId =============*/
  getBusinessFlowByWebFlowId(webFlowId: string) {
    // Ensure businessFlowArr is an object and has data
    if (this.businessFlowArr && Object.keys(this.businessFlowArr).length) {
      return this.businessFlowArr[webFlowId] ?? [];
    }
    return [];
  }

  /*============= Get BusinessFlows by FlowModel =============*/
  getBusinessFlowByFlowModel(webFlowId: string, flowActivityModelId: string) {
    const flows = this.businessFlowArr[Number(webFlowId)];
    if (!flows) {
      return [];
    }
    // Filter business flows by flowActivityModelId
    return flows.filter(flow => String(flow.flowActivityModelId) === String(flowActivityModelId));
  }
  /*============= Update BusinessFlows =============*/
  updateBusinessFlows(webFlowId: number, businessFlowDto: BusinessFlowDto) {
    if (!this.businessFlowArr) {
      this.businessFlowArr = {};
    }

    const id = Number(webFlowId);

    if (!this.businessFlowArr[id]) {
      this.businessFlowArr[id] = [];
    }

    // Find the existing entry using `flowActivityModelId` and `webFlowData.id`
    const index = this.businessFlowArr[id].findIndex(flow =>
      Number(flow.flowActivityModelId) === Number(businessFlowDto.flowActivityModelId) &&
      Number(flow.webFlowData?.id) === Number(businessFlowDto.webFlowData?.id)
    );

    if (index !== -1) {
      // Update the existing business flow if found
      this.businessFlowArr[id][index] = {
        ...this.businessFlowArr[id][index],
        ...businessFlowDto
      };
    } else {
      this.businessFlowArr[id].push(businessFlowDto);
    }
  }

  /*============= END Update BusinessFlows =============*/

  /*============= Get BusinessFlows Methods =============*/
  getAllBusinessFlows(): BusinessFlowDto[] {
    if (!this.businessFlowArr) {
      return [];
    }

    return [].concat(...Object.values(this.businessFlowArr) as BusinessFlowDto[][]);
  }

  /*============= Clear BusinessFlows  =============*/
  clearBusinessFlow() {
    this.businessFlowArr = [];
  }
  /*============= End Clear BusinessFlows  =============*/

  storeAttachedBusinessIntegration(BusinessFlowDto: BusinessFlowDto[]) {
    this.businessAttachedIntegartion = BusinessFlowDto
  }

  getAttachedBusinessIntegration(integrationId) {
    return this.businessAttachedIntegartion.filter(item => item.attachedBusinessIntegration?.id === integrationId);
  }

  getAttachedIntegrationByScriptId(scriptId) {
    return this.businessAttachedIntegartion.filter(item => item.scriptData?.id === scriptId);
  }

  getIntByFlowActivityModelId(id, flowActivityModelId) {
    return this.businessAttachedIntegartion.find(item =>
      Number(item.attachedBusinessIntegration?.id) === Number(id) &&
      Number(item.flowActivityModelId) === Number(flowActivityModelId)
    );

  }

  storeSelectedScriptId(scriptId) {
    this.selectedScriptId = scriptId;
  }

  getSelectedScriptId() {
    return this.selectedScriptId;
  }

  /*============= All Workspace Methods =============*/
  storeWorkspaces(workspaces: Array<Workspace>) {
    this.workspaces = [];
    this.workspaces = workspaces;
  }

  /*============= Get Workspaces =============*/
  getWorkspaces() {
    return this.workspaces;
  }


  clearWorkspaces() {
    this.workspaces = [];
  }
  /*============= END All Workspace Methods =============*/

  /*============= Store Workspace Id Methods =============*/
  storeSelectedWorkspaceId(workspaceId: number) {
    this.selectedWorkspaceId = null;
    this.selectedWorkspaceId = workspaceId;
  }

  getSelectedWorkspaceId() {
    return this.selectedWorkspaceId;
  }

  clearSelectedWorkspaceId() {
    this.selectedWorkspaceId = null;
  }
  /*============= END Store Workspace Id Methods =============*/

  /*============= Net Users Methods =============*/
  storeNetUsers(netUsersDto: any) {
    const foundIndex = this.netUsers.findIndex(x => Number(x.workspaceId) === Number(netUsersDto.workspaceId));
    if (foundIndex !== -1) {
      this.netUsers[foundIndex] = netUsersDto;
    } else {
      this.netUsers.push(netUsersDto);
    }
  }

  createNetUser(workspaceId: number, netUser: NetUser) {
    const foundIndex = this.netUsers.findIndex(x => Number(x.workspaceId) === Number(workspaceId));
    if (foundIndex !== -1) {
      this.netUsers[foundIndex].netUsers.push(netUser);
    }
  }

  updateNetUser(workspaceId: number, netUser: NetUser) {
    const foundIndex = this.netUsers.findIndex(x => Number(x.workspaceId) === Number(workspaceId));
    if (foundIndex !== -1) {
      const index = this.netUsers[foundIndex].netUsers.findIndex(e => Number(e?.id) === Number(netUser?.id));
      this.netUsers[foundIndex].netUsers[index] = netUser;
    }
  }

  deleteNetUser(workspaceId: number, netUserId: number) {
    let netUsers = null;
    if (this.netUsers?.length) {
      netUsers = this.netUsers.find(x => Number(x?.workspaceId) === Number(workspaceId));
    }
    if (netUsers?.netUsers?.length) {
      const foundIndex = netUsers?.netUsers.findIndex(x => Number(x.id) === Number(netUserId));
      if (foundIndex > -1) {
        netUsers?.netUsers.splice(foundIndex, 1);
      }
    }
  }

  getAllNetUsersByWorkspaceId(workspaceId: number) {
    let netUsers = null;
    if (this.netUsers?.length) {
      netUsers = this.netUsers.find(x => Number(x?.workspaceId) === Number(workspaceId));
    }
    return netUsers;
  }

  clearNetUsers() {
    this.netUsers = [];
  }
  /*============= END Net Users Methods =============*/

  /*============= Global Parameters Methods =============*/
  storeGlobalParameter(globalParamsDto: any) {
    const foundIndex = this.globalParameters.findIndex(x => Number(x.workspaceId) === Number(globalParamsDto.workspaceId));
    if (foundIndex !== -1) {
      this.globalParameters[foundIndex] = globalParamsDto;
    } else {
      this.globalParameters.push(globalParamsDto);
    }
  }

  createGlobalParam(workspaceId: number, globalParam: GlobalParameter) {
    const foundIndex = this.globalParameters.findIndex(x => Number(x.workspaceId) === Number(workspaceId));
    if (foundIndex !== -1) {
      this.globalParameters[foundIndex].globalParams.push(globalParam);
    }
  }

  updateGlobalParam(workspaceId: number, globalParam: GlobalParameter) {
    const foundIndex = this.globalParameters.findIndex(x => Number(x.workspaceId) === Number(workspaceId));
    if (foundIndex !== -1) {
      const index = this.globalParameters[foundIndex].globalParams.findIndex(e => Number(e?.id) === Number(globalParam?.id));
      this.globalParameters[foundIndex].globalParams[index] = globalParam;
    }
  }

  deleteGlobalParameter(workspaceId: number, paramId: number) {
    let globalParams = null;
    if (this.globalParameters?.length) {
      globalParams = this.globalParameters.find(x => Number(x?.workspaceId) === Number(workspaceId));
    }
    if (globalParams?.globalParams?.length) {
      const foundIndex = globalParams?.globalParams.findIndex(x => Number(x.id) === Number(paramId));
      if (foundIndex > -1) {
        globalParams?.globalParams.splice(foundIndex, 1);
      }
    }
  }

  getGlobalParamsByWorkspaceId(workspaceId: number) {
    let globalParams = null;
    if (this.globalParameters?.length) {
      globalParams = this.globalParameters.find(x => Number(x?.workspaceId) === Number(workspaceId));
    }
    return globalParams;
  }

  clearGlobalParams() {
    this.globalParameters = [];
  }
  /*============= END Global Parameters Methods =============*/

  /*============= Integration Methods =============*/
  storeIntegrationItemTree(treeItems: any) {
    this.integrationItemTree = [];
    this.integrationItemTree = treeItems;
  }

  getIntegrationItemTree() {
    return this.integrationItemTree;
  }

  clearIntegrationItemTree() {
    this.integrationItemTree = [];
  }
  /*============= END Integration Methods =============*/



  /*============= Search Integration Item =============*/
  storeIntSearchItem(item: any) {
    this.searchIntItem = item;
  }

  getIntSearchItem() {
    return this.searchIntItem;
  }

  clearIntSearchItem() {
    this.searchIntItem = '';
  }
  /*============= END Search Item =============*/

  /*============= Search Process Item =============*/
  storeProcessSearchItem(item: any) {
    this.searchProcessItem = item;
  }

  getProcessSearchItem() {
    return this.searchProcessItem;
  }

  clearProcessSearchItem() {
    this.searchProcessItem = '';
  }
  /*============= END Search Item =============*/

  /*============= Search Item =============*/
  storeTriggerSearchItem(item: any) {
    this.searchTriggerItem = item;
  }

  getTriggerSearchItem() {
    return this.searchTriggerItem;
  }

  clearTriggerSearchItem() {
    this.searchTriggerItem = '';
  }
  /*============= END Search Item =============*/

  /*============= Store Integration tree Item Count =============*/
  storeIntTreeItemCount(count: number) {
    this.intTreeItemCount = count;
  }

  getIntTreeItemCount() {
    return this.intTreeItemCount;
  }

  clearIntTreeItemCount() {
    this.intTreeItemCount = null;
  }
  /*============= END Integration tree Item Count =============*/

  /*============= Store Process tree Item Count =============*/
  storeProcessTreeItemCount(count: number) {
    this.processTreeItemCount = count;
  }

  getProcessTreeItemCount() {
    return this.processTreeItemCount;
  }

  clearProcessTreeItemCount() {
    this.processTreeItemCount = null;
  }
  /*============= END Process tree Item Count =============*/

  /*============= Store Trigger tree Item Count =============*/
  storeTriggerTreeItemCount(count: number) {
    this.triggerTreeItemCount = count;
  }

  getTriggerTreeItemCount() {
    return this.triggerTreeItemCount;
  }

  clearTriggerTreeItemCount() {
    this.triggerTreeItemCount = null;
  }
  /*============= END TriggerTreeItemCount tree Item Count =============*/


  /*============= Process Methods =============*/
  storeProcessItemTree(treeItems: any) {
    this.processItemTree = [];
    this.processItemTree = treeItems;
  }

  getProcessItemTree() {
    return this.processItemTree;
  }

  clearProcessItemTree() {
    this.processItemTree = [];
  }
  /*============= END Process Methods =============*/

  /*============= Trigger Methods =============*/
  storeTriggerItemTree(treeItems: any) {
    this.triggerItemTree = [];
    this.triggerItemTree = treeItems;
  }

  getTriggerItemTree() {
    return this.triggerItemTree;
  }

  clearTriggerItemTree() {
    this.triggerItemTree = [];
  }
  /*============= END Trigger Methods =============*/

  /*============= Process Tree Items Details Methods =============*/
  storeProcessTreeItemDetails(treeItemDetails: any) {
    this.processTreeItemDetails.push(treeItemDetails);
  }

  getProcessTreeItemDetails(workspaceId: number, processId: number) {
    let processItemDetails = null;
    processItemDetails = this.processTreeItemDetails?.length ? this.processTreeItemDetails.find(x => (Number(x?.workspaceId) === Number(workspaceId) && Number(x?.processId) === Number(processId))) : null;
    return processItemDetails;
  }

  deleteProcessTreeItemDetails(workspaceId: number, processId: number) {
    if (this.processTreeItemDetails?.length) {
      const foundIndex = this.processTreeItemDetails.findIndex(x => (Number(x.workspaceId) === Number(workspaceId) && Number(x.processId) === Number(processId)));
      if (foundIndex > -1) {
        this.processTreeItemDetails.splice(foundIndex, 1);
      }
    }
  }

  clearProcessTreeItemDetails() {
    this.processTreeItemDetails = [];
  }
  /*============= END Process Tree Items Details Methods =============*/

  /*============= Integration By Process Id Methods =============*/
  storeIntegrationByProcessId(processIntegrations: any) {
    this.integrationByProcessId.push(processIntegrations);
  }

  getIntegrationsByProcessId(workspaceId: number, processId: number) {
    let processIntegrationsList = null;
    processIntegrationsList = this.integrationByProcessId?.length ? this.integrationByProcessId.find(x => (Number(x?.workspaceId) === Number(workspaceId) && Number(x?.processId) === Number(processId))) : null;
    return processIntegrationsList;
  }

  deleteIntegrationByProcessId(workspaceId: number, processId: number) {
    if (this.integrationByProcessId?.length) {
      const foundIndex = this.integrationByProcessId.findIndex(x => (Number(x.workspaceId) === Number(workspaceId) && Number(x.processId) === Number(processId)));
      if (foundIndex > -1) {
        this.integrationByProcessId.splice(foundIndex, 1);
      }
    }
  }

  clearIntegrationsByProcessId() {
    this.integrationByProcessId = [];
  }
  /*============= END Integration By Process Id Methods =============*/

  /*============= Service Logs Methods =============*/
  storeServiceLogs(serviceLogsDto: StoreServcieLogsDto) {
    //  && (x.timeFrame === serviceLogsDto.timeFrame)
    const foundIndex = this.serviceLogArr.findIndex(x => ((Number(x.workspaceId) === Number(serviceLogsDto.workspaceId)) && (Number(x.itemId) === Number(serviceLogsDto.itemId)) && (x.itemType === serviceLogsDto.itemType)));
    if (foundIndex !== -1) {
      this.serviceLogArr[foundIndex] = serviceLogsDto;
    } else {
      this.serviceLogArr.push(serviceLogsDto);
    }
  }

  getServiceLogs(serviceLogsDto: StoreServcieLogsDto) {
    let serviceLogs = null;
    if (this.serviceLogArr?.length) {
      //  && (x.timeFrame === serviceLogsDto.timeFrame)
      serviceLogs = this.serviceLogArr.find(x => ((Number(x.workspaceId) === Number(serviceLogsDto.workspaceId)) && (Number(x.itemId) === Number(serviceLogsDto.itemId)) && (x.itemType === serviceLogsDto.itemType)));
    }
    return serviceLogs;
  }

  clearServiceLogs() {
    this.serviceLogArr = [];
  }
  /*============= END Service Logs Methods =============*/

  /*============= Event Logs Methods =============*/
  storeEventLogs(eventLogDto: StoreEventLogsDto) {
    //  && (x.timeFrame === eventLogDto.timeFrame)
    const foundIndex = this.eventLogArr.findIndex(x => ((Number(x.workspaceId) === Number(eventLogDto.workspaceId)) && (Number(x.itemId) === Number(eventLogDto.itemId)) && (x.itemType === eventLogDto.itemType)));
    if (foundIndex !== -1) {
      this.eventLogArr[foundIndex] = eventLogDto;
    } else {
      this.eventLogArr.push(eventLogDto);
    }
  }

  getEventLogs(eventLogDto: StoreEventLogsDto) {
    let eventLogs = null;
    if (this.eventLogArr?.length) {
      //  && (x.timeFrame === eventLogDto.timeFrame)
      eventLogs = this.eventLogArr.find(x => ((Number(x.workspaceId) === Number(eventLogDto.workspaceId)) && (Number(x.itemId) === Number(eventLogDto.itemId)) && (x.itemType === eventLogDto.itemType)));
    }
    return eventLogs;
  }

  clearEventLogs() {
    this.eventLogArr = [];
  }
  /*============= END Event Logs Methods =============*/

  /*============= PIT Tab Index Methods =============*/
  storeIntegrationTabIndex(tabIndex: number) {
    this.integrationTabIndex = tabIndex;
  }

  getIntegrationTabIndex() {
    return this.integrationTabIndex;
  }

  clearIntegrationTabIndex() {
    this.integrationTabIndex = 0;
  }

  storeProcessTabIndex(tabIndex: number) {
    this.processTabIndex = tabIndex;
  }

  getProcessTabIndex() {
    return this.processTabIndex;
  }

  clearProcessTabIndex() {
    this.processTabIndex = 0;
  }

  storeTriggerTabIndex(tabIndex: number) {
    this.triggerTabIndex = tabIndex;
  }

  getTriggerTabIndex() {
    return this.triggerTabIndex;
  }

  clearTriggerTabIndex() {
    this.triggerTabIndex = 0;
  }
  /*============= END PIT Tab Index Methods =============*/

  /*============= Net Users Executables Methods =============*/
  storeNetUsersExecutables(netUsersExecutables: any) {
    this.netUsersExecutables = [];
    this.netUsersExecutables = netUsersExecutables;
  }

  updateNetUserExecutables(id: number, netUserExe: any) {
    const foundIndex = this.netUsersExecutables.findIndex(x => Number(x.id) === Number(id));
    if (foundIndex !== -1) {
      this.netUsersExecutables[foundIndex] = netUserExe;
    }
  }

  deleteNetUserExecutables(id: number) {
    if (this.netUsersExecutables?.length) {
      const foundIndex = this.netUsersExecutables.findIndex(x => (Number(x.id) === Number(id)));
      if (foundIndex > -1) {
        this.netUsersExecutables.splice(foundIndex, 1);
      }
    }
  }

  getNetUsersExecutables() {
    return this.netUsersExecutables;
  }

  clearNetUsersExecutables() {
    this.netUsersExecutables.map(x => x.netUsers = null);
    this.netUsersExecutables = [];
  }
  /*============= END Net Users Executables Methods =============*/

  /*============= Process Executables Methods =============*/
  storeProcessExecutables(executables: Array<ScriptDto>) {
    this.processExecutables = [];
    this.processExecutables = executables;
  }

  getProcessExecutables() {
    return this.processExecutables;
  }

  clearProcessExecutables() {
    this.processExecutables = [];
  }
  /*============= END Process Executables Methods =============*/


  /*============= Deleted Process Executables Methods =============*/
  storeDeletedExecutables(deletedExe: ScriptDto) {
    this.deletedProcessExecutables.push(deletedExe)
  }

  getDeletedExecutables() {
    return this.deletedProcessExecutables;
  }

  clearDeletedExecutables() {
    this.deletedProcessExecutables = [];
  }
  /*============= END Deleted Process Executables Methods =============*/

  /*============= Log Maintenance Methods =============*/
  storeLogMaintenanceConfig(logMaintenanceConfig: Array<LogMaintenance>) {
    this.logMaintenanceConfig = [];
    this.logMaintenanceConfig = logMaintenanceConfig;
  }

  getLogMaintenanceConfig() {
    return this.logMaintenanceConfig;
  }

  clearLogMaintenanceConfig() {
    this.logMaintenanceConfig = [];
  }
  /*============= END Log Maintenance Methods =============*/

  /*============= Alert Processes Methods =============*/
  storeAlertProcesses(alertProcesses: Array<AlertProcess>) {
    this.alertProcesses = [];
    this.alertProcesses = alertProcesses;
  }

  getAlertProcesses() {
    return this.alertProcesses;
  }

  clearAlertProcesses() {
    this.alertProcesses = [];
  }
  /*============= END Alert Processes Methods =============*/

  /*============= Alert Processes Methods =============*/
  storeIdentifiers(identifiers: [any]) {
    this.identifiers = [];
    this.identifiers = identifiers;
  }

  getIdentifiers() {
    return this.identifiers;
  }

  clearIdentifiers() {
    this.identifiers = [];
  }
  /*============= END Alert Processes Methods =============*/


  /*============= Script Engine Groups Methods =============*/
  storeSEGroups(scriptEngineGroups: Array<ScriptEngineGroup>) {
    this.scriptEngineGroups = [];
    this.scriptEngineGroups = scriptEngineGroups;
  }

  getSEGroups() {
    return this.scriptEngineGroups;
  }

  clearSEGroups() {
    this.scriptEngineGroups = [];
  }
  /*============= END Script Engine Groups Methods =============*/

  /*============= Queue Groups Methods =============*/
  storeQueueGroup(queueGroups: Array<QueueGroup>) {
    this.queueGroups = [];
    this.queueGroups = queueGroups;
  }

  getQueueGroups() {
    return this.queueGroups;
  }

  clearQueueGroups() {
    this.queueGroups = [];
  }
  /*============= END Queue Groups Methods =============*/

  /*============== Store Current Parameters Data For Back and Forth Methods ==============*/
  storeCurrentParamsData(currentParamertersData: any) {
    this.currentParamertersData = [];
    this.currentParamertersData = currentParamertersData;
  }

  getCurrentParamsData() {
    return this.currentParamertersData;
  }

  clearCurrentParamsData() {
    this.currentParamertersData = [];
  }
  /*============== END Store Current Parameters Data For Back and Forth Methods ==============*/

  /*============== Store Process Parameters Data ==============*/
  storeProcessParamsData(processParamertersData: any) {
    this.processParamertersData = [];
    this.processParamertersData = processParamertersData;
  }

  getProcessParamsData() {
    return this.processParamertersData;
  }

  clearProcessParamsData() {
    this.processParamertersData = [];
  }
  /*============== END Store Current Parameters Data For Back and Forth Methods ==============*/

  /*============== Store Current Config Trigger Parameters Data For Back and Forth Methods ==============*/
  storeTriggerConfigParamsData(currentTriggerConfigParamertersData: any) {
    this.currentTriggerConfigParamertersData = [];
    this.currentTriggerConfigParamertersData = currentTriggerConfigParamertersData;
  }

  getCurrentTriggerConfigParamsData() {
    return this.currentTriggerConfigParamertersData;
  }

  clearCurrentTriggerConfigParamsData() {
    this.currentTriggerConfigParamertersData = [];
  }

  /*============== Store Version History Methods ==============*/
  storeVersionHistory(versionHistory: any) {
    this.versionHistory.push(versionHistory);
  }

  getVersionHistory(workspaceId: number, itemType: string, itemId: number) {
    let versionHistory = null;
    versionHistory = this.versionHistory?.length ? this.versionHistory.find(x => ((Number(x?.workspaceId) === Number(workspaceId)) && (x?.itemType === itemType) && (Number(x?.itemId) === Number(itemId)))) : null;
    return versionHistory;
  }

  getDeployedVersion() {
    if (this.versionHistory?.length) {
      const deployedVersions = this.versionHistory[0]?.versionHistory?.versionInfoList.find(version => version.deployedVersion);
      return deployedVersions;
    }
  }

  deleteVersionHistory(workspaceId: number, itemType: string, itemId: number, versionId: number) {
    let versionHistory = null;
    versionHistory = this.versionHistory?.length ? this.versionHistory.find(x => ((Number(x?.workspaceId) === Number(workspaceId)) && (x?.itemType === itemType) && (Number(x?.itemId) === Number(itemId)))) : null;
    if (versionHistory?.versionHistory?.versionInfoList?.length) {
      const foundIndex = versionHistory?.versionHistory?.versionInfoList.findIndex(x => Number(x.id) === Number(versionId));
      if (foundIndex > -1) {
        versionHistory?.versionHistory?.versionInfoList.splice(foundIndex, 1);
      }
    }
  }

  clearVersionHistory() {
    this.versionHistory = [];
  }
  /*============== END Store Version History Methods ==============*/

  /*============= Store Selected Process Item Methods =============*/
  storeSelectedProcessItem(processItem: any) {
    this.selectedProcessItem = null;
    this.selectedProcessItem = processItem;
  }

  getSelectedProcessItem() {
    return this.selectedProcessItem;
  }

  clearSelectedProcessItem() {
    this.selectedProcessItem = null;
  }

  /*============= Store Selected Process Item Id Methods =============*/
  storeSelectedProcessId(processId: any) {
    this.selectedProcessId = null;
    this.selectedProcessId = processId;
  }

  getSelectedProcessId() {
    return this.selectedProcessId;
  }

  clearSelectedProcessId() {
    this.selectedProcessId = null;
  }

  /*============= Store Selected Integration Item Methods =============*/
  storeSelectedIntegrationItem(integrationItem: any) {
    this.selectedInegrationItem = null;
    this.selectedInegrationItem = integrationItem;
  }

  getSelectedIntegrationItem() {
    return this.selectedInegrationItem;
  }

  clearSelectedIntegrationItem() {
    this.selectedInegrationItem = null;
  }

  /*============= Store Selected Integration Item Methods =============*/
  storeSelectedIntegrationId(integrationId: any) {
    this.selectedInegrationId = null;
    this.selectedInegrationId = integrationId;
  }

  getSelectedIntegrationId() {
    return this.selectedInegrationId;
  }

  clearSelectedIntegrationId() {
    this.selectedInegrationId = null;
  }


  /*============= Store Selected Integration Filter Methods =============*/
  storeSelectedIntegrationFilter(integrationFilter: any) {
    this.selectedInegrationFilter = [];
    this.selectedInegrationFilter = integrationFilter;
  }

  getSelectedIntegrationFilter() {
    return this.selectedInegrationFilter;
  }

  clearSelectedIntegrationFilter() {
    this.selectedInegrationFilter = [];
  }

  /*============= Store Custom Integration Filter Methods =============*/
  storeIntegrationFilter(integrationFilter: any) {
    this.integrationFilter = [];
    this.integrationFilter = integrationFilter;
  }

  getIntegrationFilter() {
    return this.integrationFilter;
  }

  clearIntegrationFilter() {
    this.integrationFilter = [];
  }

  /*============= Store Selected Trigger Item Methods =============*/
  storeSelectedTriggerItem(triggerItem: any) {
    this.selectedTriggerItem = null;
    this.selectedTriggerItem = triggerItem;
  }

  getSelectedTriggerItem() {
    return this.selectedTriggerItem;
  }

  clearSelectedTriggerItem() {
    this.selectedTriggerItem = null;
  }

  /*============= Store Selected process Filter Methods =============*/
  storeSelectedProcessFilter(processFilter: any) {
    this.selectedProcessFilter = [];
    this.selectedProcessFilter = processFilter;
  }

  getSelectedProcessFilter() {
    return this.selectedProcessFilter;
  }

  clearSelectedProcessFilter() {
    this.selectedProcessFilter = [];
  }

  /*============= Store Process Filter Methods =============*/
  storeProcessFilter(processFilter: any) {
    this.processFilter = [];
    this.processFilter = processFilter;
  }

  getProcessFilter() {
    return this.processFilter;
  }

  clearProcessFilter() {
    this.processFilter = [];
  }

  /*============= Store Selected trigger Filter Methods =============*/
  storeSelectedTriggerFilter(triggerFilter: any) {
    this.selectedTriggerFilter = [];
    this.selectedTriggerFilter = triggerFilter;
  }

  getSelectedTriggerFilter() {
    return this.selectedTriggerFilter;
  }

  clearSelectedTriggerFilter() {
    this.selectedTriggerFilter = [];
  }

  /*============= Store trigger Filter Methods =============*/
  storeTriggerFilter(triggerFilter: any) {
    this.triggerFilter = [];
    this.triggerFilter = triggerFilter;
  }

  getTriggerFilter() {
    return this.triggerFilter;
  }

  clearTriggerFilter() {
    this.triggerFilter = [];
  }

  /*============= Store Selected Web Service Methods =============*/
  storeSelectedWebServiceItem(webServiceItem: any) {
    this.selectedWebServiceItem = null;
    this.selectedWebServiceItem = webServiceItem;
  }

  getSelectedWebServiceItem() {
    return this.selectedWebServiceItem;
  }

  clearSelctedWebServiceItem() {
    this.selectedWebServiceItem = null;
  }

  /*============= Store Selected trigger Filter Methods =============*/
  storeSelectedWebServiceFilter(webServiceFilter: any) {
    this.selectedWebServiceFilter = [];
    this.selectedWebServiceFilter = webServiceFilter;
  }

  getSelectedWebServiceFilter() {
    return this.selectedWebServiceFilter;
  }

  clearSelectedWebServiceFilter() {
    this.selectedWebServiceFilter = [];
  }

  /*============= Store Expanded PIT Tree Methods =============*/
  storeExpandedTree(tree: Array<any>) {
    this.expandedTree = [];
    this.expandedTree = tree;
  }

  getExpandedTree() {
    return this.expandedTree;
  }

  clearExpandedTree() {
    this.expandedTree = [];
  }

  storeExpandedIntegrationTree(tree: Array<any>) {
    this.expandedIntegrationTree = [];
    this.expandedIntegrationTree = tree;
  }

  getExpandedIntegrationTree() {
    return this.expandedIntegrationTree;
  }

  clearExpandedIntegrationTree() {
    this.expandedIntegrationTree = [];
  }

  storeExpandedTriggerTree(tree: Array<any>) {
    this.expandedTriggerTree = [];
    this.expandedTriggerTree = tree;
  }

  getExpandedTriggerTree() {
    return this.expandedTriggerTree;
  }

  clearExpandedTriggerTree() {
    this.expandedTriggerTree = [];
  }

  /*============= Store PIT General Form Info Methods =============*/
  storePITGeneralFormData(formValues: any) {
    this.pitGeneralFormData = null;
    this.pitGeneralFormData = formValues;
  }

  getPITGeneralFormData() {
    return this.pitGeneralFormData;
  }

  clearPITGeneralFormData() {
    this.pitGeneralFormData = null;
  }

  /*============= Store PIT General Form Info Methods =============*/
  storeConnectedProcessToInt(connectedProcesses: any) {
    this.connectedProcessToIntegration.push(connectedProcesses);
  }

  getConnectedProcessToIntByWorkspaceId(workspaceId: number) {
    const connectedProcesses = this.connectedProcessToIntegration.find((item) => Number(item.workspaceId) === Number(workspaceId));
    return connectedProcesses?.processes;
  }

  clearConnectedProcessToInt() {
    this.connectedProcessToIntegration = [];
  }

  storeSelectedProcessInInt(selectedProcess: any) {
    this.selectedProcessObj = selectedProcess;
  }

  getSelectedProcessInInt() {
    return this.selectedProcessObj;
  }

  /*============= Applied Filters Methods =============*/
  storeAppliedFilters(appliedFilters: AppliedFilters) {
    this.appliedFilters = this.appliedFilters;
    this.appliedFilters = appliedFilters;
  }

  getAppliedFilters() {
    return this.appliedFilters;
  }

  storeAllWebFlows(webFlow: any) {
    this.allWebFlowData = [];
    this.allWebFlowData = webFlow;
  }


  getAllWebFlows() {
    return this.allWebFlowData;
  }

  clearAllWebFlows() {
    this.allWebFlowData = [];
  }

  getAllWebFlowsById(id: string) {
    if (this.allWebFlowData) {
      // Assuming `allWebFlowData` is an array of WebFlow objects
      return this.allWebFlowData.find((webFlow: WebFlow) => Number(webFlow.id) === Number(id));
    }
    return null;  // Or throw an error, depending on your desired behavior
  }

  getSelectedWebFlowById(id, flowActivityModelId: string) {
    // Iterate through the flows to find the corresponding flow
    const flow = this.allWebFlowData.find((webFlow: WebFlow) => Number(webFlow.id) === Number(id));
    if (flow?.webFlowActivityNameDataList?.length) {
      // Find the items within the flow where the flowActivityModelId matches
      const filteredActivityList = flow.webFlowActivityNameDataList.find(item => Number(item.flowActivityModelId) === Number(flowActivityModelId));
      return filteredActivityList;
    }
    return []; // Return an empty array if no matching flowActivityModelId is found
  }

  clearAppliedFilters() {
    let defaultWorkspaceId: number;
    const allWorkspaces = this.getWorkspaces();
    if (allWorkspaces?.length) {
      allWorkspaces.forEach(item => {
        if (item?.defaultWorkspace) {
          defaultWorkspaceId = Number(item?.id);
        }
      });
    }
    this.appliedFilters = {
      selectedWorkspace: defaultWorkspaceId,
      currentTab: 0,
      searchTerm: '',
      undeployed: true,
      locked: false,
      disabled: false
    };
  }

  storeSelectedBusiFlowIntegration(integration: any) {
    this.selectedBusiFlowIntegration = null;
    this.selectedBusiFlowIntegration = integration;
  }

  getSelectedBusiFlowIntegration() {
    return this.selectedBusiFlowIntegration;
  }

  clearSelectedBusiFlowIntegration() {
    this.selectedBusiFlowIntegration = null;
  }

  /*============= Deployed Integration Associated process Methods =============*/
  storeDeployedIntAssociatedProcess(associatedProcess: any) {
    this.associatedProcess = null;
    this.associatedProcess = associatedProcess;
  }

  getDeployedIntAssociatedProcess() {
    return this.associatedProcess;
  }

  clearDeployedIntAssociatedProcess() {
    this.associatedProcess = null;
  }
  /*============= END Deployed Integration Associated process Methods =============*/

  /*============= Deployed Executable Process Method =============*/
  storeDeployedProcessExecutable(deployedProcessExecutable: any) {
    this.deployedProcessExecutable = null;
    this.deployedProcessExecutable = deployedProcessExecutable;
  }

  getDeployedProcessExecutable() {
    return this.deployedProcessExecutable;
  }

  clearDeployedProcessExecutable() {
    this.deployedProcessExecutable = null;
  }
  /*============= END Deployed Executable Process Method =============*/

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
