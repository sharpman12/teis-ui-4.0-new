import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-add-on-search',
  templateUrl: './add-on-search.component.html',
  styleUrls: ['./add-on-search.component.scss']
})
export class AddOnSearchComponent implements OnInit, OnDestroy {
  addOnSearchForm: UntypedFormGroup;

  searchBy = [
    { id: 1, value: 'Name', selected: false },
    { id: 2, value: 'Description', selected: false },
    { id: 3, value: 'Recently created', selected: false }
  ];

  validationMessages = {
    searchStr: {
      required: "Enter text to continue.",
      maxlength: "Maximum 2000 characters are allowed.",
      hasWhitespace: "Whitespace not allowed.",
      invalidOperators: "Invalid use of operators: Avoid consecutive pipes or ANDs, especially after a space.",
      invalidPipeOrAnd: `Input cannot start or end with "|" or "&".`,
      noSingleQuote: `Single quotes are not allowed.`,
      singleQuoteNotClosed: 'Single quotes must be closed.',
      invalidDoubleQuotedWords: `Input must contain words in double quotes, optionally separated by | or &. Empty double quotes are not allowed.`,
      emptyInput: '',
      invalidStartOperator: 'Input cannot start with operator.',
      invalidEndOperator: 'Input cannot end with operator.',
      invalidUnclosedQuote: 'Unclosed quote invalid input.',
      invalidMoreOperator: 'More than one operator not allowed.',
      invalidMixOperator: 'Mixed operators not allowed.',
      invalidPattern: 'Pattern not matched.',
      invalidLiteralWithOperator: 'Literal phrase with operator not allowed.'
    },
    searchByGrp: {
      atLeastOne: `At least one checkbox must be selected.`
    }
  };

  formErrors = {
    searchStr: "",
    searchByGrp: ""
  };

  constructor(
    public dialogRef: MatDialogRef<AddOnSearchComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private messageService: MessageService
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.addOnSearchForm = this.fb.group({
      searchStr: [
        { value: "", disabled: false },
        {
          validators: [
            Validators.required,
          ],
        },
      ],
      searchByGrp: this.fb.group({
        name: [{ value: false, disabled: false }, {
          validators: []
        }],
        description: [{ value: false, disabled: false }, {
          validators: []
        }],
        recentlyCreated: [{ value: false, disabled: false }, {
          validators: []
        }]
      }, { validators: this.atLeastOneCheckboxValidator })
    });
    this.addOnSearchForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.addOnSearchForm);
    });
  }

  atLeastOneCheckboxValidator(group: FormGroup): { [key: string]: any } | null {
    const isAtLeastOneChecked = Object.values(group.controls).some(
      (control) => control.value
    );
    return isAtLeastOneChecked ? null : { atLeastOne: true };
  }

  logValidationErrors(group: UntypedFormGroup = this.addOnSearchForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = "";
        if (
          abstractControl &&
          !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty)
        ) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + " ";
            }
          }
        }
      }
    });
  }

  search() {
    this.addOnSearchForm.markAllAsTouched();
    this.logValidationErrors();
    this.atLeastOneCheckboxValidator;
    const formValue = this.addOnSearchForm.getRawValue();
  }

  /*=============== On Cancelled =============*/
  onClosed(): void {
    const obj = {
      isSearch: false
    };
    this.dialogRef.close(obj);
  }
  /*=============== END On Cancelled =============*/

  ngOnDestroy(): void {

  }
}
