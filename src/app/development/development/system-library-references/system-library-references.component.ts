import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DevelopmentService } from '../../development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { WinwrapRequestDto } from '../../development';
import { is } from 'date-fns/locale';
import { MessageService } from 'primeng/api';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';

@Component({
  selector: 'app-system-library-references',
  templateUrl: './system-library-references.component.html',
  styleUrls: ['./system-library-references.component.scss']
})
export class SystemLibraryReferencesComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  sysLibsArr: Array<any> = [];
  referencesArr: Array<any> = [];
  searchReferences: string = '';
  searchSysLib: string = '';

  getSysLibListSub = Subscription.EMPTY;
  getReferencesListSub = Subscription.EMPTY;
  attachSysLibListSub = Subscription.EMPTY;
  attachReferencesListSub = Subscription.EMPTY;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<SystemLibraryReferencesComponent>,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
    private messageService: MessageService,
    public dialog: MatDialog,
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    if (this.dialogData?.isSysLibClick) {
      this.getSystemLibrariesLists();
    } else {
      this.getReferencesLists();
    }
  }

  ngOnInit(): void {

  }

  /*============== Get System Library List ==============*/
  getSystemLibrariesLists() {
    this.getSysLibListSub = this.developmentService.getSystemLibraries().subscribe((res) => {
      const sysLibs = JSON.parse(JSON.stringify(res)).filter((x: any) => Number(x?.id) !== Number(this.dialogData?.scriptId));
      if (sysLibs?.length) {
        sysLibs.map((x) => {
          x.selected = false;
        });
        if (this.dialogData?.sysLibRefList?.length) {
          this.dialogData?.sysLibRefList?.forEach((id: any) => {
            const sysLib = sysLibs.find((x: any) => x.id === id);
            if (sysLib) {
              sysLib.selected = true;
            }
          });
        }
      }
      this.sysLibsArr = sysLibs.filter((x: any) => x?.connectable);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============== Get References List ==============*/
  getReferencesLists() {
    const attachSysLibObj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [this.dialogData?.tabId],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.dialogData?.workspaceId,
      scriptId: this.dialogData?.scriptId,
      attachSysLibIds: [],
      attachedReferenceIds: [],
      debugSeId: this.dialogData?.debugSeId,
      debugSeUrl: this.dialogData?.debugSeUrl,
      genId: this.dialogData?.genId
      // userName: this.currentUser?.userName,
      // scriptType: this.dialogData?.type,
      // deployedCopy: this.dialogData?.lockInfo.isLocked ? false : true,
      // versionId: 0,
      // isVersionCopy: false
    };

    const debugSeId = this.dialogData?.debugSeId;
    const debugSeUrl = this.dialogData?.debugSeUrl;

    this.getReferencesListSub = this.developmentService.getReferences(attachSysLibObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res?.length) {
        this.referencesArr = this.createReferencesString(res);
        const f = this.referencesArr.filter((x) => x?.ref === 'Accessibility');
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============== Attached System Library to Script ==============*/
  attachedSysLib() {
    if (this.sysLibsArr?.length) {
      // const selectedSysLibs = this.sysLibsArr.filter((x) => x.selected);
      // const isUndeployedSyslib = selectedSysLibs.some((x) => !x?.deployed);
      // if (isUndeployedSyslib) {
      //   this.dialog.open(ConfirmationComponent, {
      //     width: '700px',
      //     data: 'One or more selected system library are not deployed. Do you want to continue?',
      //   }).afterClosed().subscribe((confirmed) => {
      //     if (confirmed) {
      //       this.connectSysLibs();
      //     }
      //   });
      // } else {
      //   this.connectSysLibs();
      // }
      this.connectSysLibs();
    }
  }

  connectSysLibs() {
    const selectedSysLibs = this.sysLibsArr.filter((x) => x.selected);
    const selectedSysLibsIds = selectedSysLibs?.length ? selectedSysLibs.map((s) => s?.id) : [];
    const attachSysLibObj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [this.dialogData?.tabId],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.dialogData?.workspaceId,
      scriptId: this.dialogData?.scriptId,
      attachSysLibIds: selectedSysLibsIds,
      attachedReferenceIds: [],
      debugSeId: this.dialogData?.debugSeId,
      debugSeUrl: this.dialogData?.debugSeUrl
    };

    const debugSeId = this.dialogData?.debugSeId;
    const debugSeUrl = this.dialogData?.debugSeUrl;

    this.attachSysLibListSub = this.developmentService.attachSysLib(attachSysLibObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        this.dialogRef.close({
          isSysLibAttached: true,
          isReferenceAttached: false,
          selectedSysLibs: this.sysLibsArr.filter((x) => x.selected),
          selectedRefernces: [],
          attachedReferenceIds: []
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============== Attached References to Script ==============*/
  attachedReferences() {
    if (this.referencesArr?.length) {
      const selectedReferencesIds = [];
      const selectedReferences = this.referencesArr.filter((x) => x.selected).map((s) => s);
      const references = JSON.parse(JSON.stringify(selectedReferences));
      if (references?.length) {
        references.forEach((x) => {
          selectedReferencesIds.push(x?.reference);
          delete x.ref;
        });
      }

      this.dialogRef.close({
        isSysLibAttached: false,
        isReferenceAttached: true,
        selectedSysLibs: [],
        selectedRefernces: this.referencesArr.filter((x) => x.selected),
        attachedReferenceIds: selectedReferencesIds
      });

      // const attachRefObj: WinwrapRequestDto = {
      //   jsonMap: null,
      //   headers: null,
      //   clientId: [this.dialogData?.tabId],
      //   contentType: 'application/winwrap;charset=utf-8',
      //   workspaceId: this.dialogData?.workspaceId,
      //   scriptId: this.dialogData?.scriptId,
      //   attachSysLibIds: [],
      //   attachedReferenceIds: selectedReferencesIds,
      //   debugSeId: this.dialogData?.debugSeId,
      //   debugSeUrl: this.dialogData?.debugSeUrl,
      //   genId: this.dialogData?.genId
      // };

      // const debugSeId = this.dialogData?.debugSeId;
      // const debugSeUrl = this.dialogData?.debugSeUrl;

      // this.attachReferencesListSub = this.developmentService.attachReferences(attachRefObj, debugSeId, debugSeUrl).subscribe((res) => {
      //   if (res) {
      //     this.dialogRef.close({
      //       isSysLibAttached: false,
      //       isReferenceAttached: true,
      //       selectedSysLibs: [],
      //       selectedRefernces: this.referencesArr.filter((x) => x.selected),
      //       attachedReferenceIds: selectedReferencesIds
      //     });
      //   }
      // }, (err: HttpErrorResponse) => {
      //   if (err.error instanceof Error) {
      //     // handle client side error here
      //   } else {
      //     // handle server side error here
      //   }
      // });
    }
  }

  createReferencesString(data: Array<any>) {
    // Check if data is an array and has elements
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    // Map through the array and split the Reference string
    // into parts using '#' as the delimiter
    // and return the last part as a new property 'str'
    // for each object in the array
    // Filter out any objects where the last part is an empty string
    // and return the modified array
    // Check if data is an array and has elements
    const result = data.map((obj) => {
      const parts = obj.reference.split('#');
      const ref = parts[parts.length - 1];
      const location = parts[parts.length - 2];
      const lang = 'Standard';

      // Check if the last part is a non-empty string
      if (ref) {
        return { ...obj, ref: ref, location: location, lang: lang, selected: obj?.selected };
      }

      // Skip by returning null, undefined, or filtering later
      return null;
    }).filter(Boolean); // Remove null/undefined entries

    // Return the modified array
    return result;
  }

  onClose(): void {
    this.dialogRef.close({
      isSysLibAttached: false,
      isReferenceAttached: false
    });
  }

  ngOnDestroy(): void {
    this.getSysLibListSub.unsubscribe();
    this.getReferencesListSub.unsubscribe();
    this.attachSysLibListSub.unsubscribe();
    this.attachReferencesListSub.unsubscribe();
  }
}
