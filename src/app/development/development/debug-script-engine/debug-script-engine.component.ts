import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { DevelopmentService } from '../../development.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-debug-script-engine',
  templateUrl: './debug-script-engine.component.html',
  styleUrls: ['./debug-script-engine.component.scss']
})
export class DebugScriptEngineComponent implements OnInit, OnDestroy {
  debugScriptEngineForm: UntypedFormGroup;
  scriptEngineGroups: Array<any> = [];
  scriptEngines: Array<any> = [];
  debugSeStatus: number = 1;

  private getScriptEngineInfoSub = Subscription.EMPTY;

  validationMessages = {
    scriptEngineGroup: {
      required: "Script engine group is required",
    },
    scriptEngine: {
      required: "Script engine is required",
    }
  };

  formErrors = {
    scriptEngineGroup: '',
    scriptEngine: ''
  }

  constructor(
    public dialogRef: MatDialogRef<DebugScriptEngineComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
    private messageService: MessageService,
  ) {
    this.getScriptEnginesInfo();
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.debugScriptEngineForm = this.fb.group({
      scriptEngineGroup: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngine: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    });

    this.debugScriptEngineForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.debugScriptEngineForm);
    });
  }

  logValidationErrors(group: UntypedFormGroup = this.debugScriptEngineForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    });
  }

  /*============= Get Script Engines Info =============*/
  getScriptEnginesInfo(): void {
    this.getScriptEngineInfoSub = this.developmentService.getScriptEngineInfo().subscribe((res) => {
      if (res?.length) {
        this.scriptEngineGroups = res;
        this.debugScriptEngineForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.scriptEngineGroupId);
        this.onChangeSEGroup();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onChangeSEGroup(): void {
    const formValues = this.debugScriptEngineForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValues?.scriptEngineGroup);
    if (selectedGroup) {
      this.scriptEngines = selectedGroup?.scriptEnginesDetails || [];
      this.debugScriptEngineForm.get('scriptEngine').patchValue(this.scriptEngines[0]?.scriptEngineId);
      this.onChangeDebugSE();
    }
  }

  onChangeDebugSE() {
    const formValues = this.debugScriptEngineForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => x.scriptEngineId === formValues?.scriptEngine);
    this.debugSeStatus = selectedScriptEngine?.debugSeStatus;
  }

  openScript(): void {
    const formValues = this.debugScriptEngineForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValues?.scriptEngineGroup);
    const selectedScriptEngine = this.scriptEngines.find(x => x.scriptEngineId === formValues?.scriptEngine);
    if (selectedScriptEngine?.debugSeStatus === 0 || !selectedScriptEngine?.debugSeStatus) {
      this.messageService.add({ key: 'appInfoMsgKey', severity: 'info', summary: '', detail: `The Debug Engine component is either not running or is not installed for the selected process engine. Please ensure that Debug Engine is properly installed and running.` });
      return;
    } else {
      const obj = {
        isOpen: true,
        debugSE: {
          debugSeId: selectedScriptEngine?.scriptEngineId,
          debugSeName: selectedScriptEngine?.scriptEngineKey,
          debugSeUrl: selectedScriptEngine?.debugSeUrl,
          scriptEngineGroupId: selectedGroup?.scriptEngineGroupId,
          scriptEngineGroupName: selectedGroup?.scriptEngineGroupName,
        }
      };
      this.dialogRef.close(obj);
    }
  }

  onClose(): void {
    const obj = {
      isOpen: false,
      debugSE: null
    }
    this.dialogRef.close(obj);
  }

  ngOnDestroy(): void {
    this.getScriptEngineInfoSub.unsubscribe();
  }
}
