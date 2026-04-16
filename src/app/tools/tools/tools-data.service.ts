import { Injectable } from '@angular/core';
import { ExportedData, ImportResultDto } from './tools';

@Injectable({
  providedIn: 'root'
})
export class ToolsDataService {

  /*------------ Export Items Tab Property ------------*/
  private integrationsItemIds = [];
  private processItemIds = [];
  private triggerItemIds = [];

  private storeAllIntegrationItemIds = [];
  private storeAllProcessItemIds = [];
  private storeAllTriggerItemIds = [];

  /*------------ Export Script Tab Property ------------*/
  private templateIds = [];
  private scriptIds = []

  /*------------ Export Parameters Tab Property ------------*/
  private globalParametersIds = [];
  private applicationParametersIds = [];

  /*------------ Export Tab Property ------------*/
  private exportedData: ExportedData;

  /*------------ Import Parse Workspace Data Property ------------*/
  private importParseWorkspace: ExportedData;

  /*------------ Import Items Tab Property ------------*/
  private importIntegrationsItemIds = [];
  private importProcessItemIds = [];
  private importTriggerItemIds = [];

  private storeAllImportIntegrationItemIds = [];
  private storeAllImportProcessItemIds = [];
  private storeAllImportTriggerItemIds = [];

  /*------------ Import Details Tab Property ------------*/
  private importTemplateIds = [];
  private importScriptIds = []

  /*------------ Import Details Tab Property ------------*/
  private importGlobalParametersIds = [];
  private importApplicationParametersIds = [];
  private importedData: ImportResultDto;

  constructor() { }

  /*------------ Export Items Tab Methods ------------*/
  storeIntegrationsItemIds(integrationsIds: Array<any>) {
    this.integrationsItemIds = [];
    this.integrationsItemIds = integrationsIds;
  }

  storeAllSelectedIntegrationItemIds(intItemIds: Array<any>) {
    this.storeAllIntegrationItemIds = [];
    this.storeAllIntegrationItemIds = intItemIds;
  }

  storeProcessItemIds(processIds: Array<any>) {
    this.processItemIds = [];
    this.processItemIds = processIds;
  }

  storeAllSelectedProcessItemIds(proItemIds: Array<any>) {
    this.storeAllProcessItemIds = [];
    this.storeAllProcessItemIds = proItemIds;
  }

  storeTriggerItemIds(triggerIds: Array<any>) {
    this.triggerItemIds = [];
    this.triggerItemIds = triggerIds;
  }

  storeAllSelectedTriggerItemIds(trigItemIds: Array<any>) {
    this.storeAllTriggerItemIds = [];
    this.storeAllTriggerItemIds = trigItemIds;
  }

  getIntegrationItemIds() {
    let uniqueIntegrationItemIds = [];
    if (this.integrationsItemIds?.length) {
      uniqueIntegrationItemIds = this.integrationsItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueIntegrationItemIds;
  }

  getAllSelectedIntegrationItemIds() {
    let uniqueAllSelectedIntegrationItemIds = [];
    if (this.storeAllIntegrationItemIds?.length) {
      uniqueAllSelectedIntegrationItemIds = this.storeAllIntegrationItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueAllSelectedIntegrationItemIds;
  }

  getProcessItemIds() {
    let uniqueProcessItemIds = [];
    if (this.processItemIds?.length) {
      uniqueProcessItemIds = this.processItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueProcessItemIds;
  }

  getAllSelectedProcessItemIds() {
    let uniqueAllSelectedProcessItemIds = [];
    if (this.storeAllProcessItemIds?.length) {
      uniqueAllSelectedProcessItemIds = this.storeAllProcessItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueAllSelectedProcessItemIds;
  }

  getTriggerItemIds() {
    let uniqueTriggerItemIds = [];
    if (this.triggerItemIds?.length) {
      uniqueTriggerItemIds = this.triggerItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueTriggerItemIds;
  }

  getAllSelectedTriggerItemIds() {
    let uniqueAllSelectedTriggerItemIds = [];
    if (this.storeAllTriggerItemIds?.length) {
      uniqueAllSelectedTriggerItemIds = this.storeAllTriggerItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueAllSelectedTriggerItemIds;
  }

  clearItemIds() {
    this.integrationsItemIds = [];
    this.storeAllIntegrationItemIds = [];
    this.processItemIds = [];
    this.storeAllProcessItemIds = [];
    this.triggerItemIds = [];
    this.storeAllTriggerItemIds = [];
  }
  /*------------ END Items Tab Methods ------------*/

  /*------------ Export Script Tab Methods ------------*/
  storeTemplateIds(tempIds: Array<number>) {
    this.templateIds = [];
    this.templateIds = tempIds;
  }

  storeScriptIds(scriptIds: Array<number>) {
    this.scriptIds = [];
    this.scriptIds = scriptIds;
  }

  getTemplateIds() {
    let uniqueTemplateIds = [];
    if (this.templateIds?.length) {
      uniqueTemplateIds = this.templateIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueTemplateIds;
  }

  getScriptIds() {
    let uniqueScriptIds = [];
    if (this.scriptIds?.length) {
      uniqueScriptIds = this.scriptIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueScriptIds;
  }

  clearTempScriptIds() {
    this.templateIds = [];
    this.scriptIds = [];
  }
  /*------------ END Export Script Tab Methods ------------*/

  /*------------ Parameters Tab Methods ------------*/
  storeGlobalParamsIds(globalParamsIds: Array<number>) {
    this.globalParametersIds = [];
    this.globalParametersIds = globalParamsIds;
  }

  storeAppParamsIds(appParamsIds: Array<number>) {
    this.applicationParametersIds = [];
    this.applicationParametersIds = appParamsIds;
  }

  getGlobalParamsIds() {
    let uniqueGlobalParamsIds = [];
    if (this.globalParametersIds?.length) {
      uniqueGlobalParamsIds = this.globalParametersIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueGlobalParamsIds;
  }

  getAppParamsIds() {
    let uniqueAppParamsIds = [];
    if (this.applicationParametersIds?.length) {
      uniqueAppParamsIds = this.applicationParametersIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueAppParamsIds;
  }

  clearParamsIds() {
    this.globalParametersIds = [];
    this.applicationParametersIds = [];
  }
  /*------------ END Parameters Tab Methods ------------*/

  /*------------ Export Tab Methods ------------*/
  storeExportData(exportData: ExportedData) {
    this.exportedData = null;
    this.exportedData = exportData;
  }

  getExportData() {
    return this.exportedData;
  }

  clearExportData() {
    this.exportedData = null;
  }

  /*------------ Import Parse Workspace Data Method ------------*/
  storeImportParseWorkspace(parsedWorkspace: ExportedData) {
    this.importParseWorkspace = null;
    this.importParseWorkspace = parsedWorkspace;
  }

  getImportParseWorkspace() {
    return this.importParseWorkspace;
  }

  clearImportParseWorkspace() {
    this.importParseWorkspace = null;
  }

  /*------------ Imports Items Tree Methods ------------*/
  storeImportIntegrationsItemIds(integrationsIds: Array<any>) {
    this.importIntegrationsItemIds = [];
    this.importIntegrationsItemIds = integrationsIds;
  }

  storeAllImportIntegrationsItemIds(intIds: Array<any>) {
    this.storeAllImportIntegrationItemIds = [];
    this.storeAllImportIntegrationItemIds = intIds;
  }

  storeImportProcessItemIds(processIds: Array<any>) {
    this.importProcessItemIds = [];
    this.importProcessItemIds = processIds;
  }

  storeAllImportProcessesItemIds(proIds: Array<any>) {
    this.storeAllImportProcessItemIds = [];
    this.storeAllImportProcessItemIds = proIds;
  }

  storeImportTriggerItemIds(triggerIds: Array<any>) {
    this.importTriggerItemIds = [];
    this.importTriggerItemIds = triggerIds;
  }

  storeAllImportTriggersItemIds(trigIds: Array<any>) {
    this.storeAllImportTriggerItemIds = [];
    this.storeAllImportTriggerItemIds = trigIds;
  }

  getImportIntegrationItemIds() {
    let uniqueImportIntegrationItemIds = [];
    if (this.importIntegrationsItemIds?.length) {
      uniqueImportIntegrationItemIds = this.importIntegrationsItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueImportIntegrationItemIds;
  }

  getAllImportIntegrationsItemIds() {
    let uniqueAllImportIntegrationItemIds = [];
    if (this.storeAllImportIntegrationItemIds?.length) {
      uniqueAllImportIntegrationItemIds = this.storeAllImportIntegrationItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueAllImportIntegrationItemIds;
  }

  getImportProcessItemIds() {
    let uniqueImportProcessItemIds = [];
    if (this.importProcessItemIds?.length) {
      uniqueImportProcessItemIds = this.importProcessItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueImportProcessItemIds;
  }

  getAllImportProcessesItemIds() {
    let uniqueAllImportProcessesItemIds = [];
    if (this.storeAllImportProcessItemIds?.length) {
      uniqueAllImportProcessesItemIds = this.storeAllImportProcessItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueAllImportProcessesItemIds;
  }

  getImportTriggerItemIds() {
    let uniqueImportTriggerItemIds = [];
    if (this.importTriggerItemIds?.length) {
      uniqueImportTriggerItemIds = this.importTriggerItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueImportTriggerItemIds;
  }

  getAllImportTriggersItemIds() {
    let uniqueAllImportTriggersItemIds = [];
    if (this.storeAllImportTriggerItemIds?.length) {
      uniqueAllImportTriggersItemIds = this.storeAllImportTriggerItemIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueAllImportTriggersItemIds;
  }

  clearImportItemIds() {
    this.importIntegrationsItemIds = [];
    this.importProcessItemIds = [];
    this.importTriggerItemIds = [];
    this.storeAllImportIntegrationItemIds = [];
    this.storeAllImportProcessItemIds = [];
    this.storeAllImportTriggerItemIds = [];
  }
  /*------------ END Imports Items Tree Methods ------------*/

  /*------------ Import Details Tab Methods ------------*/
  storeImportTemplate(tempIds: Array<number>) {
    this.importTemplateIds = [];
    this.importTemplateIds = tempIds;
  }

  storeImportScript(scriptIds: Array<number>) {
    this.importScriptIds = [];
    this.importScriptIds = scriptIds;
  }

  getImportTemplate() {
    let uniqueImportTemplateIds = [];
    if (this.importTemplateIds?.length) {
      uniqueImportTemplateIds = this.importTemplateIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueImportTemplateIds;
  }

  getImportScript() {
    let uniqueImportScriptIds = [];
    if (this.importScriptIds?.length) {
      uniqueImportScriptIds = this.importScriptIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueImportScriptIds;
  }

  clearImportTempScript() {
    this.importTemplateIds = [];
    this.importScriptIds = [];
  }
  /*------------ END Import Details Tab Methods ------------*/

  /*------------ Import Details Tab Methods ------------*/
  storeImportGlobalParams(globalParamsIds: Array<number>) {
    this.importGlobalParametersIds = [];
    this.importGlobalParametersIds = globalParamsIds;
  }

  storeImportAppParams(appParamsIds: Array<number>) {
    this.importApplicationParametersIds = [];
    this.importApplicationParametersIds = appParamsIds;
  }

  getImportGlobalParams() {
    let uniqueImportGlobalParamsIds = [];
    if (this.importGlobalParametersIds?.length) {
      uniqueImportGlobalParamsIds = this.importGlobalParametersIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueImportGlobalParamsIds;
  }

  getImportAppParams() {
    let uniqueImportAppParamsIds = [];
    if (this.importApplicationParametersIds?.length) {
      uniqueImportAppParamsIds = this.importApplicationParametersIds.filter((x, i, a) => a.indexOf(x) == i);
    }
    return uniqueImportAppParamsIds;
  }

  clearImportParams() {
    this.importGlobalParametersIds = [];
    this.importApplicationParametersIds = [];
  }

  storeImportedData(importedDetails: ImportResultDto) {
    this.importedData = null;
    this.importedData = importedDetails;
  }

  getImportedData() {
    return this.importedData;
  }

  clearImportedData() {
    this.importedData = null;
  }
  /*------------ END Import Details Tab Methods ------------*/
}
