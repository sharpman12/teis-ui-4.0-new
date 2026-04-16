import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pipeOperatorNotAllowedValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

        if (!control.value) {
            // if control is empty return no error
            return null;
        }

        const forbidden = control.value?.includes('|');
        return forbidden ? { pipeOperatorNotAllowed: true } : null;
    };
}