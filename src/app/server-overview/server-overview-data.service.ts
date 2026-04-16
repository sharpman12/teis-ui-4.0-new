import { Injectable } from '@angular/core';
import { Workspace } from '../application-integration/app-integration/appintegration';

@Injectable({
  providedIn: 'root'
})
export class ServerOverviewDataService {
  /*============= Script Engine Group Properties =============*/
  private scriptEngineGroup: Array<any> = [];

  /*============= All Workspaces Properties =============*/
  private workspaces: Array<Workspace> = [];

  /*============= Selected WorkspaceId For Item Cache Properties =============*/
  private itemCacheworkspacesId: number = null;

  /*============= Selected WorkspaceId For Task Cache Properties =============*/
  private taskCacheworkspacesId: number = null;

  /*============= Item Cache Properties =============*/
  private itemCache: Array<any> = [];

  /*============= Task Cache Properties =============*/
  private taskCache: Array<any> = [];

  constructor() { }

  /*============= Script Engine Group Methods =============*/
  storeScriptEngineGroups(scriptEngineGrp: Array<any>) {
    this.scriptEngineGroup = [];
    this.scriptEngineGroup = scriptEngineGrp;
  }

  getSEGroups() {
    return this.scriptEngineGroup;
  }

  clearSEGroups() {
    this.scriptEngineGroup = [];
  }

  /*============= All Workspace Methods =============*/
  storeWorkspaces(workspaces: Array<Workspace>) {
    this.workspaces = [];
    this.workspaces = workspaces;
  }

  getWorkspaces() {
    return this.workspaces;
  }

  clearWorkspaces() {
    this.workspaces = [];
  }
  /*============= END All Workspace Methods =============*/

  /*============= Selected WorkspaceId For Item Cache =============*/
  storeSelectedWsId(workspaceId: number) {
    this.itemCacheworkspacesId = workspaceId;
  }

  getItemCacheWorspaceId() {
    return this.itemCacheworkspacesId;
  }

  clearItemCacheWorkspaceId() {
    this.itemCacheworkspacesId = null;
  }

  /*============= Selected WorkspaceId For Task Cache =============*/
  storeSelectedWsIdTaskCache(workspaceId: number) {
    this.taskCacheworkspacesId = workspaceId;
  }

  getTaskCacheWorspaceId() {
    return this.taskCacheworkspacesId;
  }

  clearWorkspaceIdTaskCache() {
    this.taskCacheworkspacesId = null;
  }

  /*============= Item Cache Methods =============*/
  storeItemCache(itemCacheInfo: any) {
    this.itemCache.push(itemCacheInfo);
  }

  getItemCacheInfoByWorksapceId(workspaceId: number, username: string) {
    const itemCacheInfo = this.itemCache.find(x => (Number(x?.workspaceId) === Number(workspaceId) && x?.username === username));
    return itemCacheInfo;
  }

  clearItemCacheInfo() {
    this.itemCache = [];
  }
  /*============= END Item Cache Methods =============*/

  /*============= Task Cache Methods =============*/
  storeTaskCache(taskCacheInfo: any) {
    this.taskCache.push(taskCacheInfo);
  }

  getTaskCacheInfoByWorksapceId(workspaceId: number, username: string) {
    const taskCacheInfo = this.taskCache.find(x => (Number(x?.workspaceId) === Number(workspaceId) && x?.username === username));
    return taskCacheInfo;
  }

  clearTaskCacheInfo() {
    this.taskCache = [];
  }
  /*============= END Task Cache Methods =============*/
}
