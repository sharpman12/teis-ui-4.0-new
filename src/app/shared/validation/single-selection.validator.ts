import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CheckSingleSelection {
    static singleSelectionValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (control.value && Array.isArray(control.value) && control.value.length > 1) {
                return { singleSelection: true }; // Return error if more than one item is selected
            }
            return null; // No error if one or zero items are selected
        }
    }
}