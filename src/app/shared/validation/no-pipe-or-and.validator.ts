import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noPipeOrAndValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (typeof value !== 'string' || value.trim() === '') {
            return null; // Ignore empty or non-string values
        }

        // Check if it starts or ends with a pipe or AND operator
        // const startsWithInvalid = value.startsWith('| ') || value.startsWith('& ');
        // const endsWithInvalid = value.endsWith(' |') || value.endsWith(' &');
        // const startEndsWithInvalid = value.endsWith(' | ') || value.endsWith(' & ');
        // const isSingleQuote = value.includes("'");

        // return startsWithInvalid || endsWithInvalid || startEndsWithInvalid ? { invalidPipeOrAnd: true } : isSingleQuote ? { noSingleQuote: true} : null;

        const startsWithInvalid = value.startsWith('| ') || value.startsWith('& ');
        const endsWithInvalid = value.endsWith(' |') || value.endsWith(' &');
        const startEndsWithInvalid = value.endsWith(' | ') || value.endsWith(' & ');

        // Count single quotes in the string
        const singleQuoteCount = (value.match(/'/g) || []).length;

        // single quotes are unbalanced if count is odd
        const singleQuoteMismatch = singleQuoteCount % 2 !== 0;
        
        // return startsWithInvalid || endsWithInvalid || startEndsWithInvalid ? { invalidPipeOrAnd: true } : singleQuoteMismatch ? { singleQuoteNotClosed: true} : null;

        // Removed single quote validation
        return startsWithInvalid || endsWithInvalid || startEndsWithInvalid ? { invalidPipeOrAnd: true } : null;
    };
}
