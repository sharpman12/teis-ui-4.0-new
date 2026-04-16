import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function doubleQuoteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        // Regex to match each word in double quotes or group with operators
        // const pattern = /^(?:"[^"]*"(?:\s*[|&]\s*)?)+$/;
        const pattern = /^("([^"]+)"(\s*[\|\&]\s*"([^"]+)")*)$/;

        // If value doesn't match the pattern, return an error
        if (value && !pattern.test(value)) {
            return { invalidDoubleQuotedWords: true };
        }
        return null; // No error
    };
}
