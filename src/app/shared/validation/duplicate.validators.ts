import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class Duplicate {
    static DuplicateValidator(arr: Array<any>, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {

            if (!control.value) {
                // if control is empty return no error
                return null;
            }
            // test the value of the control against the regexp supplied
            let valid = true;
            if (arr?.length) {
                arr.forEach(x => {
                    if (control.value === x) {
                        valid = false;
                    }
                });
            }

            // if true, return no error (no error), else return error passed in the second parameter
            return valid ? null : error;
        }
    }
}