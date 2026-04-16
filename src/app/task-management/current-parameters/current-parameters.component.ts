import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-current-parameters',
  templateUrl: './current-parameters.component.html',
  styleUrls: ['./current-parameters.component.scss']
})
export class CurrentParametersComponent implements OnInit {
  parametersForm: UntypedFormGroup;
  otherParametersForm: UntypedFormGroup;
  parametersArr = [
    { dataType: 'Boolean', source: 'Application', name: 'AlertEnable', value: 'no' },
    { dataType: 'Numeric', source: 'Application', name: 'Chatty', value: '2' },
    { dataType: 'Numeric', source: 'Application', name: 'CurrentScript', value: '1' },
    { dataType: 'Boolean', source: 'Application', name: 'isAlertProcess', value: 'no' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CurrentParametersComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();
    const currentParameterObj = {
      isDataType: true,
      isSource: true,
      isName: false,
      isValue: false
    };
    this.parametersForm.setControl('currentParameter', this.setExistingParamerters(this.parametersArr, currentParameterObj));
    const otherParameterObj = {
      isDataType: true,
      isSource: true,
      isName: true,
      isValue: true
    };
    this.otherParametersForm.setControl('otherParameter', this.setExistingParamerters(this.parametersArr, otherParameterObj));
  }

  createForm(): void {
    this.parametersForm = this.fb.group({
      currentParameter: this.fb.array([
        this.addParameters()
      ])
    });

    this.otherParametersForm = this.fb.group({
      otherParameter: this.fb.array([
        this.addParameters()
      ])
    });
  }

  addParameters(): UntypedFormGroup {
    return this.fb.group({
      dataType: [{ value: '', disabled: true }],
      source: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: false }],
      value: [{ value: '', disabled: false }]
    });
  }

  addMoreParameters(): void {
    (<UntypedFormArray>this.parametersForm.get('currentParameter')).push(this.addParameters());
  }

  setExistingParamerters(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    parameters.forEach(p => {
      formArray.push(this.fb.group({
        dataType: [{ value: p.dataType, disabled: isCtrlDisabled.isDataType }],
        source: [{ value: p.source, disabled: isCtrlDisabled.isSource }],
        name: [{ value: p.name, disabled: isCtrlDisabled.isName }],
        value: [{ value: p.value, disabled: isCtrlDisabled.isValue }],
      }));
    });
    return formArray;
  }

  removeParameter(i: number) {
    (<UntypedFormArray>this.parametersForm.get('currentParameter')).removeAt(i);
  }

  onCancel() {
    this.dialogRef.close();
  }

  savedParameters() {
    
  }

}
