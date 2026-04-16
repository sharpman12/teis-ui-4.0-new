import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CheckWhitespace {
    static whitespaceValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const isWhitespace = (control?.value || '').trim().length === 0;
            const isValid = !isWhitespace;

            // if true, return no error (no error), else return error passed in the second parameter
            return isValid ? null : error;
        };
    }
}
