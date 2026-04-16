import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class commaSeparatedNumbersValidator {
    static commaSepratedDaysValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let value = control.value;

            // if (!value) return null; // Do not validate empty values (use required if needed)

            if (value === null || value === undefined || value === '') {
                return null; // skip empty values (use required if needed)
            }

            // Ensure value is always a string
            if (typeof value !== 'string') {
                value = String(value);
            }

            // Remove spaces (optional)
            value = value.replace(/\s+/g, '');

            // Check allowed pattern: 1,2,3 OR 01,02 etc.
            // const pattern = /^(\d{1,2}|3[01])(,(\d{1,2}|3[01]))*$/;
            const pattern = /^(\d{1,2}|3[01]|(\d{1,2}|3[01])-(\d{1,2}|3[01]))(,(\d{1,2}|3[01]|(\d{1,2}|3[01])-(\d{1,2}|3[01])))*$/;

            if (!pattern.test(value)) {
                return { invalidFormat: true };
            }

            const parts = value.split(',');

            let allNumbers: number[] = [];

            for (const part of parts) {
                if (part.includes('-')) {
                    // It's a range
                    const [startStr, endStr] = part.split('-');
                    const start = Number(startStr);
                    const end = Number(endStr);

                    if (start > end) {
                        return { invalidRange: true }; // e.g., 10-5
                    }

                    if (start < 1 || end > 31) {
                        return { outOfRange: true };
                    }

                    // Expand range (e.g., 1-3 => 1,2,3)
                    for (let i = start; i <= end; i++) {
                        allNumbers.push(i);
                    }
                } else {
                    // Single number
                    const num = Number(part);

                    if (num < 1 || num > 31) {
                        return { outOfRange: true };
                    }

                    allNumbers.push(num);
                }
            }

            // Duplicate check
            const unique = new Set(allNumbers);
            if (unique.size !== allNumbers.length) {
                return { duplicate: true };
            }

            return null;

            // Check number ranges individually
            // const numbers = value.split(',').map(num => Number(num));

            // const outOfRange = numbers.some(num => num < 1 || num > 31);
            // if (outOfRange) {
            //     return { outOfRange: true };
            // }

            // // 🔥 Duplicate check (normalized)
            // const normalized = numbers.map(n => Number(n)); // removes leading zeros
            // const unique = new Set(normalized);

            // if (unique.size !== normalized.length) {
            //     return { duplicate: true };
            // }

            // return null; // Valid
        };
    }
}

// export function commaSeparatedNumbersValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//         const value = control.value;

//         if (!value) return null; // Do not validate empty values (use required if needed)

//         // Check allowed pattern: 1,2,3 OR 01,02 etc.
//         const pattern = /^(\d{1,2}|3[01])(,(\d{1,2}|3[01]))*$/;

//         if (!pattern.test(value)) {
//             return { invalidFormat: true };
//         }

//         // Check number ranges individually
//         const numbers = value.split(',').map(num => Number(num));

//         const outOfRange = numbers.some(num => num < 1 || num > 31);
//         if (outOfRange) {
//             return { outOfRange: true };
//         }

//         return null; // Valid
//     };
// }
