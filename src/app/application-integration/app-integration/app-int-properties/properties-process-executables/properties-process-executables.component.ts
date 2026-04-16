import { Component, ElementRef, INJECTOR, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AppIntegrationService } from "../../app-integration.service";
import { Subject, of, Subscription } from "rxjs";
import { exhaustMap, tap } from 'rxjs/operators';
import { HttpErrorResponse } from "@angular/common/http";
import { AppIntegrationDataService } from "../../app-integration-data.service";
import { ScriptDto } from "../../appintegration";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MessageService } from "primeng/api";
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from "src/app/shared/components/confirmation/confirmation.component";
import { Constants } from "src/app/shared/components/constants";
import { Router } from "@angular/router";
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";

@Component({
  selector: "app-properties-process-executables",
  templateUrl: "./properties-process-executables.component.html",
  styleUrls: ["./properties-process-executables.component.scss"],
})
export class PropertiesProcessExecutablesComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  private getExecutables$ = new Subject<{ propertiesDetails?: any, isProperties?: boolean }>();
  isRefreshing: boolean = false;
  searchExeStr: string = '';
  executablesScripts: Array<ScriptDto> = [];
  isExeSelected: boolean = false;
  selectedExecutables: Array<ScriptDto> = [];
  itemPropertiesDetails: any = null;
  isPITLock: boolean = true;
  currentUser: any;
  propertiesDetails: any = null;
  @Input() isProcessCreateFromIntegration: boolean = false;
  @Input() isProcessUpdateFromIntegration: boolean = false;
  getExecutablesSub = Subscription.EMPTY;



  constructor(
    public router: Router,
    public dialog: MatDialog,
    private messageService: MessageService,
    private encryptDecryptService: EncryptDecryptService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  private getFilteredExecutables(executables: Array<any>): Array<any> {
    const connectableExe = (executables || []).filter(x => x?.connectable);
    return this.itemType === "trigger"
      ? connectableExe
      : connectableExe.filter(x => !x?.triggerScript);
  }

   private resetExecutableState(executables: Array<any>): Array<any> {
    return (executables || []).map((item: any) => ({
      ...item,
      isSelected: false,
      scriptContents: null,
      scriptParameterDataList: item?.scriptParameterDataList?.length
        ? item.scriptParameterDataList.map((x: any) => ({ ...x, value: null }))
        : item?.scriptParameterDataList
    }));
  }


   ngOnInit(): void {
    this.getExecutables$
      .pipe(
        exhaustMap(({ propertiesDetails, isProperties }) => {
          this.isRefreshing = true;
          this.propertiesDetails = propertiesDetails;

          const cachedExecutables = this.appIntegrationDataService.getProcessExecutables();

          if (cachedExecutables?.length) {
            const filteredExecutables = this.resetExecutableState(
              this.getFilteredExecutables(JSON.parse(JSON.stringify(cachedExecutables)))
            );
            this.isRefreshing = false;
            this.prepareExecutables(filteredExecutables, propertiesDetails, isProperties);
            return of(null);
          }

          return this.appIntegrationService.getScript(this.workspaceId, "ALL").pipe(
            tap({
              next: (res) => {
                this.appIntegrationDataService.storeProcessExecutables(res || []);
                const filteredExecutables = this.resetExecutableState(
                  this.getFilteredExecutables(JSON.parse(JSON.stringify(res || [])))
                );
                this.isRefreshing = false;
                this.prepareExecutables(filteredExecutables, propertiesDetails, isProperties);
              },
              error: () => {
                this.isRefreshing = false;
              }
            })
          );
        })
      )
      .subscribe();
  }

  resetSearch() {
    this.searchExeStr = '';
  }

 refreshExecutables() {
    this.appIntegrationDataService.clearProcessExecutables();
    this.isRefreshing = true;

    this.getExecutablesSub = this.appIntegrationService.getScript(this.workspaceId, "ALL").subscribe((res) => {
      this.appIntegrationDataService.storeProcessExecutables(res || []);
      const filteredExecutables = this.resetExecutableState(
        this.getFilteredExecutables(JSON.parse(JSON.stringify(res || [])))
      );
      this.executablesScripts = filteredExecutables;
      this.refreshSelectedExecutableDetails();
    }, (err: HttpErrorResponse) => {
      this.isRefreshing = false;
      // ...existing code...
    });
  }

  // refreshExecutables() {
  //   this.appIntegrationDataService.clearProcessExecutables();
  //   this.isRefreshing = true;
  //   this.getExecutablesSub = this.appIntegrationService.getScript(this.workspaceId, "ALL").subscribe((res) => {
  //     this.isRefreshing = false;
  //     const exe = JSON.parse(JSON.stringify(res));
  //     const connectableExe = exe.filter(x => x?.connectable);
  //     const executables = this.itemType === 'trigger' ? connectableExe : connectableExe.filter(x => !x?.triggerScript);
  //     if (executables?.length) {
  //       executables.forEach(item => {
  //         item.isSelected = false;
  //         item.scriptContents = null;
  //         if (item?.scriptParameterDataList?.length) {
  //           item?.scriptParameterDataList.forEach((x) => {
  //             x.value = null;
  //           });
  //         }
  //       });
  //     }
  //     this.executablesScripts = executables;
  //     this.appIntegrationDataService.storeProcessExecutables(this.executablesScripts);
  //     this.refreshSelectedExecutableDetails();
  //   }, (err: HttpErrorResponse) => {
  //     this.isRefreshing = false;
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  private refreshSelectedExecutableDetails(): void {
    const selectedExecutableIds = (this.selectedExecutables || [])
      .map(x => x?.id)
      .filter(id => !!id);

    if (!selectedExecutableIds.length) {
      this.isRefreshing = false;
      return;
    }

    this.appIntegrationService.getScriptDetails(selectedExecutableIds).subscribe((detailsRes) => {
      // Reset parameter values to null (same as getExecutables)
      (detailsRes || []).forEach((item: any) => {
        if (item?.scriptParameterDataList?.length) {
          item.scriptParameterDataList.forEach((x: any) => {
            x.value = null;
          });
        }
      });

      this.selectedExecutables = (detailsRes || []).map((item, index) => ({ ...item, order: index }));
      const additionalParams = this.calculateAdditionalParameters();
      this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);
      this.syncAndShareScriptParameter();

      this.isRefreshing = false;
    }, () => {
      this.isRefreshing = false;
    });
  }

  private prepareExecutables(data: any[], propertiesDetails?: any, isProperties?: boolean) {

    const connectableExe = data.filter(x => x?.connectable);
    const executables = this.itemType === 'trigger'
      ? connectableExe
      : connectableExe.filter(x => !x?.triggerScript);

    executables.forEach(item => {
      item.isSelected = false;
      item.scriptContents = null;

      if (item?.scriptParameterDataList?.length) {
        item.scriptParameterDataList.forEach(param => param.value = null);
      }
    });

    // Determine if executables can be edited
    const canEdit =
      (this.router?.url.includes("properties") || isProperties) &&
      propertiesDetails?.locked &&
      Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId);

    executables.forEach(x => x.disabled = !canEdit);

    // Override if process created from integration
    if (this.isProcessCreateFromIntegration) {
      executables.forEach(x => x.disabled = false);
    }

    this.executablesScripts = executables;
    this.updateExecutableDisabledState(this.isPITLock);

  }

  /*============ Get All Executables =============*/
  getExecutables(propertiesDetails?: any, isProperties?: boolean) {
    this.getExecutables$.next({ propertiesDetails, isProperties });

    // this.propertiesDetails = propertiesDetails;
    // const processExe = this.appIntegrationDataService.getProcessExecutables();
    // if (processExe?.length) {
    //   const connectableExe = processExe.filter(x => x?.connectable);
    //   // const executables = processExe.filter(e => !e?.triggerScript);
    //   const executables = this.itemType === 'trigger' ? connectableExe : connectableExe.filter(x => !x?.triggerScript);
    //   if (executables?.length) {
    //     executables.forEach(item => {
    //       item.isSelected = false;
    //       item.scriptContents = null;
    //     });
    //   }
    //   if (this.router?.url.includes("properties") || isProperties) {
    //     executables.map(x => ((this.router?.url.includes("properties") || isProperties) && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true);
    //   } else {
    //     executables.map(x => x.disabled = false);
    //   }
    //   if (this.isProcessCreateFromIntegration) {
    //     executables.map(x => x.disabled = false);
    //   }

    //   this.executablesScripts = executables;
    // } else {
    //   this.getExecutablesSub = this.appIntegrationService.getScript(this.workspaceId, "ALL").subscribe((res) => {
    //     const exe = JSON.parse(JSON.stringify(res));
    //     const connectableExe = exe.filter(x => x?.connectable);
    //     const executables = this.itemType === 'trigger' ? connectableExe : connectableExe.filter(x => !x?.triggerScript);
    //     if (executables?.length) {
    //       executables.forEach(item => {
    //         item.isSelected = false;
    //         item.scriptContents = null;
    //         if (item?.scriptParameterDataList?.length) {
    //           item?.scriptParameterDataList.forEach((x) => {
    //             x.value = null;
    //           });
    //         }
    //       });
    //     }
    //     if (this.router?.url.includes("properties") || isProperties) {
    //       executables.map(x => ((this.router?.url.includes("properties") || isProperties) && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true);
    //     } else {
    //       executables.map(x => x.disabled = false);
    //     }
    //     if (this.isProcessCreateFromIntegration) {
    //       executables.map(x => x.disabled = false);
    //     }
    //     this.executablesScripts = executables;
    //     this.appIntegrationDataService.storeProcessExecutables(this.executablesScripts);

    //   }, (err: HttpErrorResponse) => {
    //     if (err.error instanceof Error) {
    //       // handle client side error here
    //     } else {
    //       // handle server side error here
    //     }
    //   });
    // }
  }
  /*============ END Get All Executables =============*/

  /*============ Set Existing Executables For Properties =============*/
  setExecutables(propertiesDetails: any, isProperties?: boolean) {
    if (this.executablesScripts?.length) {
      this.executablesScripts.map(z => ((this.router?.url.includes("properties") || isProperties) && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? z.disabled = false : z.disabled = true);
    }
    this.itemPropertiesDetails = propertiesDetails;
    this.isPITLock = propertiesDetails?.locked;
    const executables = [];
    const scriptParamsList = [];
    let additionalParameters = [];
    if (propertiesDetails?.scriptList?.length) {
      propertiesDetails?.scriptList.forEach(x => {
        if (x?.scriptParameterDataList?.length) {
          x?.scriptParameterDataList.forEach(s => {
            s.value = null;
          });
          if (propertiesDetails?.paramsData?.length) {
            x?.scriptParameterDataList.forEach(s => {
              scriptParamsList.push(s);
            });
            propertiesDetails?.paramsData.forEach(z => {
              x?.scriptParameterDataList.forEach(e => {
                if (!e?.config && (z?.paramName.trim() === e?.parameterName.trim())) {
                  // e.value = (z?.securityLevel === 'medium' || z?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(z?.value) : z?.value;
                  if (e?.securityLevel.toLowerCase() === 'high' && z?.securityLevel.toLowerCase() === 'low') {
                    z.value = this.encryptDecryptService.encrypt(z?.value);
                  } else if (e?.securityLevel.toLowerCase() === 'medium' && z?.securityLevel.toLowerCase() === 'low') {
                    z.value = this.encryptDecryptService.encrypt(z?.value);
                  } else if (e?.securityLevel.toLowerCase() === 'low' && z?.securityLevel.toLowerCase() === 'medium') {
                    z.value = this.encryptDecryptService.decrypt(z?.value);
                  }
                  e.value = z.value;
                }
              });
            });
          }
        }
        executables.push(x);
      });

      /*---- Code For Additional Parameters Get Additional Paraeters ----*/
      if (propertiesDetails?.paramsData?.length) {
        additionalParameters = propertiesDetails?.paramsData.filter(item1 => {
          const foundIndex = scriptParamsList.findIndex(item2 => {
            return item2.parameterName.trim() === item1.paramName.trim();
          });
          return foundIndex === -1;
        });

        const additionalParams = additionalParameters.map(obj => {
          const newObj = {
            autoComplete: false,
            config: false,
            dataType: null,
            description: '',
            id: obj?.id,
            inParameter: false,
            lastUpdated: null,
            optionProtected: false,
            outParameter: false,
            parameterName: obj?.paramName.trim(),
            parameterTypes: null,
            probableValues: [],
            scriptId: null,
            securityLevel: obj?.securityLevel,
            storedValue: false,
            type: obj?.type,
            updatedBy: null,
            value: obj?.value,
            workspaceId: null
          };
          return newObj;
        });
        this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);
      }


      executables.map(x => ((this.router?.url.includes("properties") || isProperties) && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true);
      this.selectedExecutables = executables;
      // this.appIntegrationService.sharedScriptParams(this.selectedExecutables);
      this.shareScriptParameter(this.selectedExecutables, propertiesDetails, isProperties);
    }
  }
  /*============ END Set Existing Executables For Properties =============*/

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    this.isPITLock = isPITLock;
    this.updateExecutableDisabledState(isPITLock);
    // if (isPITLock) {
    //   if (this.executablesScripts?.length) {
    //     this.executablesScripts.map(x => x.disabled = false);
    //   }
    //   if (this.selectedExecutables?.length) {
    //     this.selectedExecutables.map(z => z.disabled = false);
    //   }
    // } else {
    //   if (this.executablesScripts?.length) {
    //     this.executablesScripts.map(x => x.disabled = true);
    //   }
    //   if (this.selectedExecutables?.length) {
    //     this.selectedExecutables.map(z => z.disabled = true);
    //   }
    // }
  }



  /**
   * Update disabled state - called once executables are loaded
   */
  private updateExecutableDisabledState(isPITLock: boolean) {
    if (isPITLock) {
      if (this.executablesScripts?.length) {
        this.executablesScripts.forEach(x => x.disabled = false);
      }
      if (this.selectedExecutables?.length) {
        this.selectedExecutables.forEach(z => z.disabled = false);
      }
    } else {
      if (this.executablesScripts?.length) {
        this.executablesScripts.forEach(x => x.disabled = true);
      }
      if (this.selectedExecutables?.length) {
        this.selectedExecutables.forEach(z => z.disabled = true);
      }
    }
  }
  /*============ END Get PIT Lock and Enable/Disable Form Feilds ============*/

  /*============ Check Step Two Validation =============*/
  validateProcessExeStepTwo() {
    let isStepTwoValidated = false;
    if (this.selectedExecutables?.length) {
      isStepTwoValidated = true;
    } else {
      isStepTwoValidated = false;
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: `${this.itemType[0].toUpperCase() + this.itemType.slice(1)} does not have an executable connected. Add an executable to continue.` });
    }
    return isStepTwoValidated;
  }
  /*============ END Check Step Two Validation =============*/

  validateProcessExeStepTwoWithError(): { errors: string[]; isValid: boolean } {
    const errors: string[] = [];

    if (!this.selectedExecutables?.length) {
      errors.push(
        `${this.itemType[0].toUpperCase() + this.itemType.slice(1)} does not have an executable connected. Add an executable to continue.`
      );
    }

    if (errors.length) {
      return { errors: errors, isValid: false };
    }

    return { errors: [], isValid: true };
  }


  /*============ On Select Executable Enable/Disabled Button =============*/
  onSelectExecutable() {
    const isExeSelected = this.executablesScripts.some(x => x?.isSelected);
    this.isExeSelected = isExeSelected;
  }
  /*============ END On Select Executable Enable/Disabled Button =============*/

  /*============ Restrict Two Trigger Script ============*/
  validateTwoTriggerScripts() {
    return this.selectedExecutables.some((x) => x?.triggerScript);
  }

  /*============ Add Executables =============*/
  // addExecutables(exe?: any, addSingleExecutable: boolean = false) {
  //   // this.appIntegrationDataService.clearNetUsersExecutables();
  //   if (this.validateTwoTriggerScripts() && exe?.triggerScript) {
  //     this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Only one trigger script can be connected to trigger.' });
  //   } else {
  //     if (exe) {
  //       exe.isSelected = true;
  //     }
  //     if (this.executablesScripts?.length) {
  //       const isMoreThanOneSelectedTriggerScript = this.executablesScripts.filter(item => (item.isSelected && item?.triggerScript))?.length > 1;
  //       const isTriggerScript = this.executablesScripts.filter(item => (item.isSelected && item?.triggerScript))?.length > 0;
  //       if (isMoreThanOneSelectedTriggerScript || (isTriggerScript && this.validateTwoTriggerScripts())) {
  //         this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Only one trigger script can be connected to trigger.' });
  //       } else {
  //         if (addSingleExecutable) {
  //           this.selectedExecutables.push(exe);
  //           exe.isSelected = false;
  //         } else {
  //           this.executablesScripts.forEach((item, i, arr) => {
  //             if (item?.isSelected) {
  //               this.selectedExecutables.push(item);
  //               item.isSelected = false;
  //             }
  //           });
  //         }
  //         this.selectedExecutables = this.selectedExecutables.map(
  //           (item, index) => ({ ...item, order: index })
  //         );

  //         // this.appIntegrationService.sharedScriptParams(this.selectedExecutables);
  //         this.shareScriptParameter(this.selectedExecutables, this.propertiesDetails, this.isProperties);
  //         this.onSelectExecutable();
  //       }
  //     }
  //   }
  // }
  /*============ Add Executables =============*/

  // ...existing code...

  private preserveCurrentParameterValues(): void {
    const currentParams = this.appIntegrationDataService.getCurrentParamsData() || [];
    if (!currentParams.length || !this.selectedExecutables?.length) {
      return;
    }

    // Flatten: drill into formArray of each group
    const flatParams: Array<{ id: string; name: string; value: any; scriptName: string }> = [];

    currentParams.forEach((group: any) => {
      const scriptName = (group?.scriptName || '').trim().toLowerCase();
      (group?.formArray || []).forEach((p: any) => {
        flatParams.push({
          id: p?.id,
          name: (p?.name || '').trim().toLowerCase(),
          value: p?.value,
          scriptName
        });
      });
    });

    if (!flatParams.length) {
      return;
    }

    this.selectedExecutables.forEach((exe) => {
      const exeScriptName = (exe?.scriptName || '').trim().toLowerCase();

      exe?.scriptParameterDataList?.forEach((param) => {
        const paramName = (param?.parameterName || '').trim().toLowerCase();
        const paramId = param?.id;

        const matched =
          flatParams.find(p => p.id && paramId && Number(p.id) === Number(paramId) && p.scriptName === exeScriptName) ||
          flatParams.find(p => p.name === paramName && p.scriptName === exeScriptName) ||
          flatParams.find(p => p.id && paramId && Number(p.id) === Number(paramId));

        if (matched && matched.value !== undefined) {
          param.value = matched.value;
        }
      });
    });
  }

  // ...existing code...

  private syncAndShareScriptParameter(): void {
    this.preserveCurrentParameterValues();
    this.shareScriptParameter(this.selectedExecutables, this.propertiesDetails, this.isProperties);
  }

  addExecutables(exe?: any, addSingleExecutable: boolean = false) {
    if (this.validateTwoTriggerScripts() && exe?.triggerScript) {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Only one trigger script can be connected to trigger.' });
    } else {
      if (exe) {
        exe.isSelected = true;
      }
      if (this.executablesScripts?.length) {
        const isMoreThanOneSelectedTriggerScript = this.executablesScripts.filter(item => (item.isSelected && item?.triggerScript))?.length > 1;
        const isTriggerScript = this.executablesScripts.filter(item => (item.isSelected && item?.triggerScript))?.length > 0;
        if (isMoreThanOneSelectedTriggerScript || (isTriggerScript && this.validateTwoTriggerScripts())) {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Only one trigger script can be connected to trigger.' });
        } else {
          if (addSingleExecutable) {
            this.selectedExecutables.push(exe);
            exe.isSelected = false;
          } else {
            this.executablesScripts.forEach((item) => {
              if (item?.isSelected) {
                this.selectedExecutables.push(item);
                item.isSelected = false;
              }
            });
          }
          this.selectedExecutables = this.selectedExecutables.map(
            (item, index) => ({ ...item, order: index })
          );

          // Keep selected order with duplicates
          const selectedSnapshot = JSON.parse(JSON.stringify(this.selectedExecutables));
          const orderedIds = selectedSnapshot
            .map(item => item?.id)
            .filter(id => id !== null && id !== undefined);

          const uniqueIds = Array.from(new Set(orderedIds));

          this.appIntegrationService.getScriptDetails(uniqueIds).subscribe((res) => {
            const detailsById = new Map<number, any>();
            (res || []).forEach((d: any) => {
              // Reset parameter values to null (same as getExecutables)
              if (d?.scriptParameterDataList?.length) {
                d.scriptParameterDataList.forEach((x: any) => {
                  x.value = null;
                });
              }
              detailsById.set(Number(d?.id), d);
            });

            // Rebuild list by original orderedIds (duplicates preserved)
            this.selectedExecutables = orderedIds.map((id, index) => {
              const detail = detailsById.get(Number(id));
              const fallback = selectedSnapshot.find(x => Number(x?.id) === Number(id));
              const base = detail ? JSON.parse(JSON.stringify(detail)) : fallback || {};
              return { ...base, order: index };
            });

            // Recalculate additional parameters
            const additionalParams = this.calculateAdditionalParameters();
            this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);

            this.syncAndShareScriptParameter();
            this.onSelectExecutable();
          });

        }
      }
    }
  }
  /*============ END Add Executables =============*/

  /*============ Remove Executables =============*/
  removeExecutable(value: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to remove '${value?.scriptName}' executable?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.selectedExecutables.indexOf(value);
        let isPITCreate = false;
        if (this.isCreatePIT.toString() === 'true') {
          isPITCreate = true;
        }
        if (this.isCreatePIT.toString() === 'false') {
          isPITCreate = false;
        }
        if (!isPITCreate) {
          this.appIntegrationDataService.storeDeletedExecutables(value);
          const deletedExe = this.appIntegrationDataService.getDeletedExecutables();
          // this.appIntegrationService.sharedDeletedScriptParameters(deletedExe);
        }

        if (index > -1) {
          this.appIntegrationDataService.deleteNetUserExecutables(value?.id);
          this.selectedExecutables.splice(index, 1);

          if (value?.triggerScript) {
            this.appIntegrationService.sharedDeletedTriggerScript({ isTriggerScriptDeleted: true, script: value });
          } else {
            this.appIntegrationService.sharedDeletedTriggerScript(null);
          }

          // Recalculate additional parameters after removal
          const additionalParams = this.calculateAdditionalParameters();
          this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);

          // this.shareScriptParameter(this.selectedExecutables, this.propertiesDetails, this.isProperties);
          this.syncAndShareScriptParameter();
          this.onSelectExecutable();
        }
      }
    });
  }
  /*============ END Remove Executables =============*/

  /*============ Drag and Drop Table Row =============*/
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedExecutables, event.previousIndex, event.currentIndex);
    this.selectedExecutables = this.selectedExecutables.map(
      (item, index) => ({ ...item, order: index })
    );

    // Recalculate additional parameters on reorder
    const additionalParams = this.calculateAdditionalParameters();
    this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);

    // this.shareScriptParameter(this.selectedExecutables, this.propertiesDetails, this.isProperties);
    this.syncAndShareScriptParameter();
  }
  /*============ END Drag and Drop Table Row =============*/

  /*============ Helper: Calculate Additional Parameters =============*/
  private calculateAdditionalParameters() {
    const scriptParamsList = [];
    let additionalParameters = [];

    // Collect all parameters from selected executables
    if (this.selectedExecutables?.length) {
      this.selectedExecutables.forEach(x => {
        if (x?.scriptParameterDataList?.length) {
          x.scriptParameterDataList.forEach(s => {
            scriptParamsList.push(s);
          });
        }
      });
    }

    const propertiesDetails = this.propertiesDetails || this.itemPropertiesDetails;

    // Filter out parameters that belong to current executables
    if (propertiesDetails?.paramsData?.length) {
      additionalParameters = propertiesDetails.paramsData.filter(item1 => {
        const foundIndex = scriptParamsList.findIndex(item2 => {
          return item2.parameterName.trim() === item1.paramName.trim();
        });
        return foundIndex === -1;
      });

      // Transform to expected format
      return additionalParameters.map(obj => ({
        autoComplete: false,
        config: false,
        dataType: null,
        description: '',
        id: obj?.id,
        inParameter: false,
        lastUpdated: null,
        optionProtected: false,
        outParameter: false,
        parameterName: obj?.paramName.trim(),
        parameterTypes: null,
        probableValues: [],
        scriptId: null,
        securityLevel: obj?.securityLevel,
        storedValue: false,
        type: obj?.type,
        updatedBy: null,
        value: obj?.value,
        workspaceId: null
      }));
    }

    return [];
  }
  /*============ END Helper: Calculate Additional Parameters =============*/
  /*============ END Add Executables =============*/

  /*============ Drag and Drop Table Row =============*/
  // drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.selectedExecutables, event.previousIndex, event.currentIndex);
  //   this.selectedExecutables = this.selectedExecutables.map(
  //     (item, index) => ({ ...item, order: index })
  //   );
  //   this.shareScriptParameter(this.selectedExecutables, this.propertiesDetails, this.isProperties);

  // }
  /*============ END Drag and Drop Table Row =============*/

  /*============ Remove Executables =============*/
  // removeExecutable(value: any) {
  //   const dialogRef = this.dialog.open(ConfirmationComponent, {
  //     width: '700px',
  //     maxHeight: '600px',
  //     data: `Are you sure you want to remove '${value?.scriptName}' executable?`
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       // this.appIntegrationDataService.clearNetUsersExecutables();
  //       const index = this.selectedExecutables.indexOf(value);
  //       let isPITCreate = false;
  //       if (this.isCreatePIT.toString() === 'true') {
  //         isPITCreate = true;
  //       }
  //       if (this.isCreatePIT.toString() === 'false') {
  //         isPITCreate = false;
  //       }
  //       if (!isPITCreate) {
  //         this.appIntegrationDataService.storeDeletedExecutables(value);
  //         const deletedExe = this.appIntegrationDataService.getDeletedExecutables();
  //         this.appIntegrationService.sharedDeletedScriptParameters(deletedExe);
  //       }
  //       // this.appIntegrationDataService.storeDeletedExecutables(value);
  //       // this.appIntegrationService.sharedDeletedScriptParameters(value);
  //       if (index > -1) {
  //         this.appIntegrationDataService.deleteNetUserExecutables(value?.id);
  //         this.selectedExecutables.splice(index, 1);
  //         if (value?.triggerScript) {
  //           this.appIntegrationService.sharedDeletedTriggerScript({ isTriggerScriptDeleted: true, script: value });
  //         } else {
  //           this.appIntegrationService.sharedDeletedTriggerScript(null);
  //         }

  //         // Recalculate additional parameters after removing executable
  //         const scriptParamsList = [];
  //         let additionalParameters = [];

  //         if (this.selectedExecutables?.length) {
  //           this.selectedExecutables.forEach(x => {
  //             if (x?.scriptParameterDataList?.length) {
  //               x?.scriptParameterDataList.forEach(s => {
  //                 scriptParamsList.push(s);
  //               });
  //             }
  //           });
  //         }

  //         const propertiesDetails = this.propertiesDetails || this.itemPropertiesDetails;
  //         if (propertiesDetails?.paramsData?.length) {
  //           additionalParameters = propertiesDetails?.paramsData.filter(item1 => {
  //             const foundIndex = scriptParamsList.findIndex(item2 => {
  //               return item2.parameterName === item1.paramName;
  //             });
  //             return foundIndex === -1;
  //           });

  //           const additionalParams = additionalParameters.map(obj => {
  //             const newObj = {
  //               autoComplete: false,
  //               config: false,
  //               dataType: null,
  //               description: '',
  //               id: obj?.id,
  //               inParameter: false,
  //               lastUpdated: null,
  //               optionProtected: false,
  //               outParameter: false,
  //               parameterName: obj?.paramName.trim(),
  //               parameterTypes: null,
  //               probableValues: [],
  //               scriptId: null,
  //               securityLevel: obj?.securityLevel,
  //               storedValue: false,
  //               type: obj?.type,
  //               updatedBy: null,
  //               value: obj?.value,
  //               workspaceId: null
  //             };
  //             return newObj;
  //           });
  //           this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);
  //         }

  //         // this.executablesScripts = this.selectedExecutables;
  //         // this.setExecutables(this.propertiesDetails, this.isProperties);
  //         // this.appIntegrationService.sharedScriptParams(this.selectedExecutables);
  //         this.shareScriptParameter(this.selectedExecutables, this.propertiesDetails, this.isProperties);
  //       }
  //     }
  //   });
  // }
  // ...existing code...

  /*============ Remove Executables =============*/

  /*============ END Remove Executables =============*/

  shareScriptParameter(exe: any, propertiesDetails: any, isProperties: boolean) {
    const obj = {
      isProperties: isProperties,
      selectedExecutables: exe,
      propertiesDetails: propertiesDetails
    };
    this.appIntegrationService.sharedScriptParams(obj);
  }

  /*=========== Reset Process Executables ===========*/
  resetProcessExe() {
    this.selectedExecutables = [];
    this.getExecutables();
  }
  /*=========== END Reset Process Executables ===========*/

  /*============== Get Process Executables Data ==============*/
  getProcessExecutablesData() {
    if (this.selectedExecutables?.length) {
      this.selectedExecutables.forEach((x, i) => {
        if (x?.scriptParameterDataList?.length) {
          x?.scriptParameterDataList.forEach((item) => {
            delete item?.currentParameterObj;
          });
        }
        delete x?.isSelected;
        delete x?.disabled;
      });
      const clonedExecutables = JSON.parse(JSON.stringify(this.selectedExecutables));
      if (clonedExecutables?.length) {
        clonedExecutables.forEach((x, i) => {
          x.order = i;
        });
      }
      return clonedExecutables;
    } else {
      return [];
    }
  }
  /*============== END Get Process Executables Data ==============*/

  ngOnDestroy(): void {
    this.getExecutablesSub.unsubscribe();
  }
}
