import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export class CheckCustomNumbers {
    static customNumberValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            // Regular Expression to match single numbers, ranges, and comma-separated numbers
            const validPattern = /^(\d{1,2}(-\d{1,2})?)?(,\d{1,2}(-\d{1,2})?)*$/;
            const stepPattern = /^\*\/[0-9]{1,2}$/;

            // Helper function to check if a number is within the range 0-23
            const isWithinRange = (num: number) => Number(num) >= Number(error?.minNum) && num <= error?.maxNum;

            if (!control.value) {
                // if control is empty return no error
                return null;
            }

            // test the value of the control against the regexp supplied
            if (!validPattern.test(control.value) && !stepPattern.test(control.value)) {
                return { invalidFormat: true }; // Invalid format
            }

            if (stepPattern.test(control.value)) {
                const stepValue = Number(control.value.split('/')[1]);
                if (!isWithinRange(stepValue)) return { invalidNumber: true };
            }

            // Split by comma
            const parts = control.value.split(',');

            for (const part of parts) {
                if (part.includes('-')) {
                    // If it's a range, validate the start and end numbers
                    const [start, end] = part.split('-').map(Number);

                    if (start > end || start < error?.minNum || end > error?.maxNum) {
                        return { invalidRange: true }; // Invalid range
                    }
                } else {
                    // If it's a single number, validate it
                    const num = Number(part);
                    if (num < error?.minNum || num > error?.maxNum) {
                        return { invalidNumber: true }; // Invalid number
                    }
                }
            }
        }
    }
}