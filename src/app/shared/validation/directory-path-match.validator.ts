import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";


export class DirectoryPathMatch {
    static DirectoryPathValidator(error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (error?.hasString) {
                // let regexAlphabets = /[a-zA-Z]/gi;
                // let regexColon = /:\s*\w*/gi;

                const regexDirectoryPath = /^[A-Za-z]:\\/;
                const regexBackslashes = /^\\\\/;
                
                if (!control.value) {
                    // if control is empty return no error
                    return null;
                }

                // test the value of the control against the regexp supplied
                const valid1 = regexDirectoryPath.test(control.value);
                const valid2 = regexBackslashes.test(control.value);

                // const valid3 = regexAlphabets.test(control.value.charAt(0));
                // const valid4 = regexColon.test(control.value.charAt(1));

                // if true, return no error (no error), else return error passed in the second parameter
                return ((valid1) || (valid2)) ? null : error;
            }
        }
    }
}