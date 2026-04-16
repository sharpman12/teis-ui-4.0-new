import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { advancedSearch } from 'src/app/shared/validation/advanced-search.validator';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { doubleQuoteValidator } from 'src/app/shared/validation/double-quote.validator';
import { noConsecutivePipesOrAndsValidator } from 'src/app/shared/validation/forbidden-pattern.validator';
import { noPipeOrAndValidator } from 'src/app/shared/validation/no-pipe-or-and.validator';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent implements OnInit {
  searchTxt: string = '';
  searchTxtArr: Array<string> = [];
  searchForm: UntypedFormGroup;
  isSearchBy: boolean = true;

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

  searchIn = [
    { id: 1, value: 'Integration' },
    { id: 2, value: 'Process' },
    { id: 3, value: 'Trigger' }
  ];

  searchBy = [
    { id: 1, value: 'Item name', selected: false },
    { id: 2, value: 'Item description', selected: false },
    { id: 3, value: 'All parameters', selected: false },
    { id: 4, value: 'Identifiers', selected: false },
    { id: 5, value: 'Net user', selected: false },
  ];

  constructor(
    public dialogRef: MatDialogRef<SearchItemComponent>,
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
    this.searchForm = this.fb.group({
      searchStr: [
        { value: "", disabled: false },
        {
          validators: [
            Validators.required,
            Validators.maxLength(2000),
            CheckWhitespace.whitespaceValidator({ hasWhitespace: true }),
            noConsecutivePipesOrAndsValidator(),
            noPipeOrAndValidator(),
            // doubleQuoteValidator(),
            advancedSearch()
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
        parameters: [{ value: false, disabled: false }, {
          validators: []
        }],
        parameterName: [{ value: false, disabled: false }, {
          validators: []
        }],
        parameterValue: [{ value: false, disabled: false }, {
          validators: []
        }],
        identifiers: [{ value: false, disabled: false }, {
          validators: []
        }],
        netUsers: [{ value: false, disabled: false }, {
          validators: []
        }],
      }, { validators: this.atLeastOneCheckboxValidator })
    });
    this.searchForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.searchForm);
    });
  }

  atLeastOneCheckboxValidator(group: FormGroup): { [key: string]: any } | null {
    const isAtLeastOneChecked = Object.values(group.controls).some(
      (control) => control.value
    );
    return isAtLeastOneChecked ? null : { atLeastOne: true };
  }

  get inputSearchError(): string | null {
    const error = this.searchForm.get('searchStr')?.errors?.['advSearchError'];
    return error || null;
  }

  logValidationErrors(group: UntypedFormGroup = this.searchForm): void {
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

  createStr(input: string) {

    // let result: string[] = [];

    // // Check if the string contains pipe (|) or AND (&) operators
    // if (input.includes(' | ') || input.includes(' & ')) {
    //   const parts = input.split(/(\||&)/); // Split by | or & while retaining the operators
    //   result = parts.map(part => (part === '|' || part === '&' ? part : `"${part.trim()}"`));
    // } else {
    //   // If no pipe or AND, split by spaces
    //   const parts = input.split(/\s+/);
    //   result = parts.map(part => `"${part.trim()}"`);
    // }

    // // Join the result array with spaces for readability
    // this.searchTxt = result.join(' ');
    // return result.join(' ');
    this.searchTxt = this.formatInputString(input);
  }

  formatString(input) {
    // Check if the input string contains double quotes
    if (input.includes('"')) {
      return input; // Keep the string as it is if it contains quotes
    }

    // Split by pipe (|), AND (&), or space
    let parts = input.split(/[\s|&]+/);

    // Join parts with pipe (|) and add quotes around each part
    let result = parts.map(part => `"${part}"`).join(' | ');

    return result;
  }

  // formatInputString(input: string): string {
  //   // Regex to split by `|` and `&` but keep quoted strings intact
  //   const regex = /("[^"]*"|[^|&\s]+)|(\||&)/g;

  //   // Split input into parts (words and operators)
  //   const parts = input.match(regex) || [];

  //   let result: string[] = [];
  //   for (let part of parts) {
  //     part = part.trim(); // Trim extra spaces
  //     if (part === '|' || part === '&') {
  //       // Push the operator as is
  //       result.push(part);
  //     } else if (part.startsWith('"') && part.endsWith('"')) {
  //       // Push quoted strings as is
  //       result.push(part);
  //     } else {
  //       // Add quotes around unquoted words
  //       result.push(`"${part}"`);
  //     }
  //   }

  //   // Join the parts back to form the output string
  //   return result.join(' ');
  // }

  // formatInputString(input: string): string {
  //   // Trim spaces first
  //   input = input.trim();

  //   // ✅ Special case: if input contains spaces but no | or & operators,
  //   // treat the entire thing as a single quoted expression
  //   if (/\s/.test(input) && !/[|&]/.test(input) && !(input.startsWith('"') && input.endsWith('"'))) {
  //     return `"${input}"`;
  //   }

  //   // ✅ If already quoted (even with spaces), just return as is
  //   if (input.startsWith('"') && input.endsWith('"')) {
  //     return input;
  //   }

  //   // Regex to split by `|` and `&` but keep quoted strings intact
  //   const regex = /("[^"]*"|[^|&\s]+)|(\||&)/g;

  //   // Split input into parts (words and operators)
  //   const parts = input.match(regex) || [];

  //   let result: string[] = [];
  //   for (let part of parts) {
  //     part = part.trim(); // Trim extra spaces
  //     if (part === '|' || part === '&') {
  //       // Push the operator as is
  //       result.push(part);
  //     } else if (part.startsWith('"') && part.endsWith('"')) {
  //       // Push quoted strings as is
  //       result.push(part);
  //     } else {
  //       // Add quotes around unquoted words
  //       result.push(`"${part}"`);
  //     }
  //   }

  //   // Join the parts back to form the output string
  //   return result.join(' ');
  // }

  formatInputString(input: string): string {
    input = input.trim();

    // ✅ 1. Handle if the entire input already has quotes — return as-is
    if (input.startsWith('"') && input.endsWith('"')) {
      return input;
    }

    // ✅ 2. Special handling: phrases separated by | or & that may include spaces
    // Example: Int 01 | Int 02  =>  "Int 01" | "Int 02"
    // Example: Int 02 and Int 03 & Int 01 or Int 04 => "Int 02 and Int 03" & "Int 01 or Int 04"
    if (/[|&]/.test(input)) {
      // Split by operators but keep them in result
      const parts = input.split(/(\||&)/).map(part => part.trim()).filter(Boolean);

      const result: string[] = [];
      for (let part of parts) {
        if (part === '|' || part === '&') {
          // Keep operators as is
          result.push(part);
        } else if (part.startsWith('"') && part.endsWith('"')) {
          // Keep quoted part as is
          result.push(part);
        } else {
          // Quote the entire phrase around each operator section
          result.push(`"${part}"`);
        }
      }
      return result.join(' ');
    }

    // ✅ 3. If the input contains spaces but no | or & and isn't already quoted → wrap it in quotes
    if (/\s/.test(input) && !/[|&]/.test(input)) {
      return `"${input}"`;
    }

    // ✅ 4. Fallback — use original logic for other complex patterns
    const regex = /("[^"]*"|[^|&\s]+)|(\||&)/g;
    const parts = input.match(regex) || [];

    const result: string[] = [];
    for (let part of parts) {
      part = part.trim();
      if (part === '|' || part === '&') {
        result.push(part);
      } else if (part.startsWith('"') && part.endsWith('"')) {
        result.push(part);
      } else {
        result.push(`"${part}"`);
      }
    }

    return result.join(' ');
  }



  formatStr(input: string): string {
    // Split the input by spaces and treat each element as separate
    const parts = input.split(/\s*\|\s*/);

    // Join the parts with " | "
    const output = parts.join(' | ');

    return output;
  }

  onSelectSearchBy() {
    this.isSearchBy = this.searchBy.some((x) => x?.selected);
  }

  search() {
    this.searchForm.markAllAsTouched();
    this.logValidationErrors();
    this.atLeastOneCheckboxValidator;
    const formValue = this.searchForm.getRawValue();
    if (this.searchForm?.valid) {
      const obj = {
        isSearch: true,
        itemType: this.dialogData?.itemType,
        searchStr: formValue?.searchStr,
        itemName: formValue?.searchByGrp?.name,
        itemDescription: formValue?.searchByGrp?.description,
        parameters: formValue?.searchByGrp?.parameters,
        parameterName: formValue?.searchByGrp?.parameterName,
        parameterValue: formValue?.searchByGrp?.parameterValue,
        identifiers: formValue?.searchByGrp?.identifiers,
        netUsers: formValue?.searchByGrp?.netUsers
      };

      const excludedIds = [1, 2, 3];
      if (this.dialogData?.selectedFilterItems && this.dialogData?.selectedFilterItems.filter(id => !excludedIds.includes(id))?.length >= 3) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "info",
          summary: "",
          detail: "Currently you have 3 active custom search filters selected, which is the maximum allowed. To add a new filter, please clear one of the active filters first.",
        });
        return; // Stop closing the dialog
      }
      this.dialogRef.close(obj);
    }
  }

  /*=============== On Cancelled =============*/
  onCancelled(): void {
    const obj = {
      isSearch: false
    };
    this.dialogRef.close(obj);
  }
  /*=============== END On Cancelled =============*/

}
