import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Constants } from 'src/app/shared/components/constants';
import { DirectoryPathMatch } from 'src/app/shared/validation/directory-path-match.validator';
import { ConfigurationsService } from '../configurations.service';

@Component({
  selector: 'app-user-interface',
  templateUrl: './user-interface.component.html',
  styleUrls: ['./user-interface.component.scss']
})
export class UserInterfaceComponent implements OnInit, OnDestroy {
  currentUser: any;
  userInterfaceConfigForm: UntypedFormGroup;
  UserInterfaceConfig: any;
  logLevel = [
    'Error',
    'Debug',
    'Info',
    'Warning'
  ];

  /*-------- User Interface Constant Values ---------*/
  constUiValues = [
    { tag: 'LogLevel', defaultValue: 'Error' },
    { tag: 'SessionTimeout', defaultValue: '60' },
    { tag: 'NumberofRecordsPerPageForLogs', defaultValue: '20' },
    { tag: 'NumberofDaysForCompeletedTask', defaultValue: '7' },
    { tag: 'Export_Path', defaultValue: 'C:\\Teis3.3Launcher\\Export' },
    { tag: 'Import_Path', defaultValue: 'C:\\Teis3.3Launcher\\Import' }
  ];

  UiSetupSub = Subscription.EMPTY;
  saveUIConfigSub = Subscription.EMPTY;

  constructor(
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private configurationsService: ConfigurationsService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {
    this.createForm();
    this.getUserInterfaceSetup();
  }

  refreshUI() {
    this.getUserInterfaceSetup();
  }

  createForm() {
    this.userInterfaceConfigForm = this.fb.group({
      uiConfigParameter: this.fb.array([
        this.addParameters(false)
      ])
    });
  }

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      description: [{ value: '', disabled: false }],
      id: [{ value: '', disabled: false }],
      tag: [{ value: '', disabled: false }],
      value: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      defaultValue: [{ value: '', disabled: false }]
    });
  }

  addMoreParameters(): void {
    (<UntypedFormArray>this.userInterfaceConfigForm.get('uiConfigParameter')).push(this.addParameters(true));
  }
  /*================== END Add More Parameters =================*/

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    parameters.forEach(p => {
      formArray.push(this.fb.group({
        description: [{ value: p.description, disabled: isCtrlDisabled.isDescription }],
        id: [{ value: p.id, disabled: isCtrlDisabled.isId }],
        tag: [{ value: p.tag, disabled: isCtrlDisabled.isTag }],
        value: [{ value: p.value, disabled: isCtrlDisabled.isValue }, {
          validators: [
            Validators.required,
            Validators.min(p?.min),
            Validators.max(p?.max),
            DirectoryPathMatch.DirectoryPathValidator({ hasString: p?.hasString })
          ]
        }],
        defaultValue: [{ value: p.value, disabled: isCtrlDisabled.isDefaultValue }]
      }));
    });
    return formArray;
  }
  /*================== Set Existing Parameters =================*/

  getUserInterfaceSetup() {
    const instanceIdentity = this.currentUser.instanceIdentity.split('_');
    this.UiSetupSub = this.configurationsService.getUiSetup(instanceIdentity[1]).subscribe(res => {
      if (res?.setupTagValueList?.length) {
        res?.setupTagValueList.forEach(item => {
          item.hasString = false;
          if (item?.tag === 'SessionTimeout') {
            item.min = 1;
            item.max = 999;
          }
          if (item?.tag === 'NumberofRecordsPerPageForLogs') {
            item.min = 20;
            item.max = 50;
          }
          if (item?.tag === 'NumberofDaysForCompeletedTask') {
            item.min = 1;
            item.max = 7;
          }
          if (item?.tag === 'Export_Path') {
            item.hasString = true;
          }
          if (item?.tag === 'Import_Path') {
            item.hasString = true;
          }
          this.constUiValues.forEach(el => {
            if (item?.tag === el?.tag) {
              item.defaultValue = el?.defaultValue;
            }
          });
        });
        this.UserInterfaceConfig = res;
        const uiConfigParameterObj = {
          isDescription: false,
          isId: false,
          isTag: false,
          isValue: false,
          isDefaultValue: false
        };
        this.userInterfaceConfigForm.setControl(
          'uiConfigParameter',
          this.setExistingParamerters(res?.setupTagValueList, uiConfigParameterObj)
        );
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  resetDefaultValues(rowName: string) {
    this.userInterfaceConfigForm.get('uiConfigParameter')['controls'].forEach((item, i, arr) => {
      this.constUiValues.forEach(el => {
        if (item?.value?.tag === rowName && item?.value?.tag === el?.tag) {
          this.userInterfaceConfigForm.get('uiConfigParameter')['controls'][i].patchValue({
            value: el?.defaultValue
          });
        }
      });
    });
  }

  resetChanges() {
    this.getUserInterfaceSetup();
    // this.userInterfaceConfigForm.get('uiConfigParameter')['controls'].forEach((item, i, arr) => {
    //   this.constUiValues.forEach(el => {
    //     if (item?.value?.tag === el?.tag) {
    //       this.userInterfaceConfigForm.get('uiConfigParameter')['controls'][i].patchValue({
    //         value: el?.defaultValue
    //       });
    //     }
    //   });
    // });
  }

  validateData(event) {
    this.userInterfaceConfigForm.get('uiConfigParameter').valueChanges.pipe(first()).subscribe(res => {});
  }

  saveUIConfiguration(uiConfig: any) {
    this.userInterfaceConfigForm.markAllAsTouched();
    if (this.userInterfaceConfigForm.valid) {
      uiConfig?.uiConfigParameter.forEach(item => {
        delete item?.defaultValue;
      });
      this.UserInterfaceConfig.setupTagValueList = uiConfig?.uiConfigParameter;
      this.saveUIConfigSub = this.configurationsService.updateUIConfig(this.UserInterfaceConfig).subscribe(res => {
        if (res) {
          this.getUserInterfaceSetup();
          this.messageService.add({
            key: 'configSuccessKey', severity: 'success', summary: '', detail: 'User interface configuration updated successfully!'
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
  }

  ngOnDestroy(): void {
    this.UiSetupSub.unsubscribe();
    this.saveUIConfigSub.unsubscribe();
  }

}
