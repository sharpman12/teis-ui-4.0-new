import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noConsecutivePipesOrAndsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value: string = control.value || '';

        // Check for two pipes (|) or ANDs (&) consecutively with a space before the first
        const invalidPattern1 = / \|{2,}/; // Two or more pipes with a space before the first
        const invalidPattern2 = / &{2,}/; // Two or more ANDs with a space before the first

        // Check for pipes and ANDs one after another
        const invalidPattern3 = /[|&]{2}/; // Any combination of | and & consecutively

        if (
            invalidPattern1.test(value) ||
            invalidPattern2.test(value) ||
            invalidPattern3.test(value)
        ) {
            return { invalidOperators: true };
        }

        return null;
    };
}
