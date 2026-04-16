import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export class CheckBlank {
    static blankValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (!control.value) {
                // if control is empty return no error
                return null;
            }

            // test the value of the control is blank
            let valid = true;
            let controlValue = control.value;
            controlValue = controlValue.split('.');
            if (!controlValue[1]) {
                valid = false;
            } else {
                valid = true;
            }

            // if true, return no error (no error), else return error passed in the second parameter
            return valid ? null : error;
        };
    }
}
