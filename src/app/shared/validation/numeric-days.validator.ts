import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export class CheckNumericDays {
    static numericDaysValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (!control.value) {
                // if control is empty return no error
                return null;
            }

            if (!/^\d+$/.test(control.value)) {
                return { invalidNumbers: true };
            }

            if (control.value < error?.minNum || control.value > error?.maxNum) {
                return { invalidNumericDay: true }; // Invalid day number
            }
        };
    }
}