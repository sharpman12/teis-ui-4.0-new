import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export class CheckNumbericSymbols {
    static numericSymbolValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (error?.hasNumberSymbols) {
                const validPattern = /^[0-9\,\-\*\/]*$/;

                if (!control.value) {
                    // if control is empty return no error
                    return null;
                }

                // test the value of the control against the regexp supplied
                const isValid = validPattern.test(control.value);

                return isValid ? null : error;
            }
        }
    }
}