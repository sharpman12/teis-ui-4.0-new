import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { KeycloakSecurityService } from './keycloak-security.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Constants } from '../components/constants';
import { DevelopmentService } from 'src/app/development/development.service';
import { first, map, shareReplay } from 'rxjs/operators';
import { UserSettingService } from 'src/app/dashboard/user-settings/user-setting.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScriptStateService implements OnDestroy {
  currentUser: any = null;
  username: string = '';
  edithorTheme: string = 'vs';

  private userSettingsSub = Subscription.EMPTY;
  private getScriptLockInfoSub = Subscription.EMPTY;

  private lockInfoSubject = new BehaviorSubject<any | null>(null);
  lockInfo$ = this.lockInfoSubject.asObservable();

  private scriptCreatedSubject = new BehaviorSubject<any>(null);
  scriptCreated$ = this.scriptCreatedSubject.asObservable();

  private openedScriptsSubject = new BehaviorSubject<any>([]);
  openedScripts$ = this.openedScriptsSubject.asObservable();

  private recentFilesSubject = new BehaviorSubject<string[]>([]);
  recentFiles$ = this.recentFilesSubject.asObservable();

  private selectedScriptSubject = new BehaviorSubject<any>(null);
  selectedScript$ = this.selectedScriptSubject.asObservable();

  private selectedScriptGenIdSubject = new BehaviorSubject<number>(null);
  scriptGenId$ = this.selectedScriptGenIdSubject.asObservable();

  private selectedTabIdSubject = new BehaviorSubject<any>(null);
  activeTabId$ = this.selectedTabIdSubject.asObservable();

  private isActionPerformedSubject = new BehaviorSubject<boolean>(false);
  isActionPerformed$ = this.isActionPerformedSubject.asObservable();

  private isScriptDeleteActionPerformedSubject = new BehaviorSubject<any>({ isDeleted: false, scriptId: null });
  isDeleteActionPerformed$ = this.isScriptDeleteActionPerformedSubject.asObservable();

  private closedOpenScriptsTab = new BehaviorSubject<boolean>(false);
  isClosedScriptTab$ = this.closedOpenScriptsTab.asObservable();

  private maxRecentFiles = 9;

  constructor(
    private kcService: KeycloakSecurityService,
    private sanitizer: DomSanitizer,
    private userSettingService: UserSettingService,
    private developmentService: DevelopmentService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    this.username = localStorage.getItem(Constants.USERNAME);
    this.loadRecentFiles();
  }

  storeEditorTheme(theme: string): void {
    this.edithorTheme = theme;
  }

  getEditorTheme(): string {
    return this.edithorTheme;
  }

  resetEditorTheme(): void {
    this.edithorTheme = 'vs';
  }

  sharedSelectedScriptData(script: any) {
    this.selectedScriptSubject.next(script);
  }

  sharedScriptGenId(genId: number) {
    this.selectedScriptGenIdSubject.next(genId);
  }

  sharedActiveTabId(tabId: number) {
    this.selectedTabIdSubject.next(tabId);
  }

  setScriptCreated(scriptData: any): void {
    if (this.scriptCreatedSubject.getValue() !== scriptData) {
      this.scriptCreatedSubject.next(scriptData);
    }
  }

  updateOpenedScripts(scripts: any): void {
    this.openedScriptsSubject.next([...scripts]);
  }

  updateScripts(script: any, lockInfo: any, debugParameters: Array<any> = []): void {
    const currentOpenScripts = this.scriptCreatedSubject.getValue();
    const allOpenScripts = this.openedScriptsSubject.getValue();
    const selectedScript = this.selectedScriptSubject.getValue();
    if (Number(script?.scriptId) === Number(selectedScript?.scriptId)) {
      selectedScript.lockInfo = lockInfo;
      selectedScript.trustedUrl = script?.trustedUrl;
      selectedScript.url = script?.url;
    }
    if (Number(script?.scriptId) === Number(currentOpenScripts?.scriptId)) {
      currentOpenScripts.lockInfo = lockInfo;
      currentOpenScripts.trustedUrl = script?.trustedUrl;
      currentOpenScripts.url = script?.url;
    }
    if (allOpenScripts?.length) {
      allOpenScripts.forEach((x) => {
        if (Number(script?.scriptId) === Number(x?.scriptId)) {
          x.lockInfo = lockInfo;
          x.trustedUrl = script?.trustedUrl;
          x.url = script?.url;
        }
      });
    }
  }

  removeOpenedScript(scriptId: any): void {
    const currentScripts = this.openedScriptsSubject.getValue();
    const index = currentScripts.findIndex((obj) => Number(obj.scriptId) === Number(scriptId));

    if (index !== -1) {
      currentScripts.splice(index, 1);
    }
    // const updatedScripts = currentScripts.filter(s => s.scriptName !== script.scriptName);
    this.openedScriptsSubject.next(currentScripts);
  }

  addOpenedScript(script: any): void {
    const currentScripts = this.openedScriptsSubject.getValue();
    if (!currentScripts.some(existingScript => existingScript.scriptId === script.scriptId)) {
      const updatedScripts = [...currentScripts, script];
      this.openedScriptsSubject.next(updatedScripts);
      this.addRecentFile(script.scriptName);
    }
  }

  setActionPerformed(action: boolean): void {
    this.isActionPerformedSubject.next(action);
  }

  setDeleteActionPerformed(obj: any): void {
    this.isScriptDeleteActionPerformedSubject.next(obj);
  }

  checkScriptTabIsOpen() {
    const openScripts = this.openedScriptsSubject.getValue();
    if (openScripts?.length > 0) {
      return true;
    }
    return false;
  }

  closedAllScriptOpenTabs(action: boolean): void {
    this.closedOpenScriptsTab.next(action);
  }

  addRecentFile(file: string): void {
    const currentFiles = this.recentFilesSubject.getValue();
    const updatedFiles = [file, ...currentFiles.filter(f => f !== file)].slice(0, this.maxRecentFiles);
    this.recentFilesSubject.next(updatedFiles);
    this.saveRecentFiles(updatedFiles);
  }

  getRecentFiles(): string[] {
    return this.recentFilesSubject.getValue();
  }

  private loadRecentFiles(): void {
    const files = localStorage.getItem('recentFiles');
    if (files) {
      this.recentFilesSubject.next(JSON.parse(files));
    }
  }

  private saveRecentFiles(files: string[]): void {
    localStorage.setItem('recentFiles', JSON.stringify(files));
  }

  getTabId(sId: string): string {
    const uniqueBrowserTabId = sessionStorage.getItem('uniqueTabId');
    return `TAB_${this.username.toUpperCase()}_${sId}_${uniqueBrowserTabId}`;
  }

  getScriptLockDetails(workspaceId: number, scriptId: number, scriptType: string): any {
    this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(workspaceId, scriptId, scriptType).subscribe((res) => {
      this.lockInfoSubject.next(res);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getUrl(wsId: number, scriptId: number, tabId: string, scriptType: string, isVersionCopy: boolean, versionId: string, isDeployed: boolean, debugSeId: string, debugSeUrl: string, theme: string, isLocked: boolean, isAllScriptCalled: boolean): any {

    const baseUrl = window.location.origin;
    const token = this.kcService.getToken();

    return this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/winwrap/?clientid=${tabId}&wId=${wsId}&exeId=${scriptId}&type=${scriptType}&isDeployed=${isDeployed}&isVersionCopy=${isVersionCopy}&versionId=${versionId}&debugSeId=${debugSeId}&debugSeUrl=${debugSeUrl}&theme=${theme}&isLocked=${isLocked}`);
  }

  ngOnDestroy(): void {
    this.userSettingsSub.unsubscribe();
    this.getScriptLockInfoSub.unsubscribe();
  }
}