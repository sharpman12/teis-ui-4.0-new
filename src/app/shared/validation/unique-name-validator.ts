// import { AbstractControl, ValidationErrors, ValidatorFn, FormArray, FormGroup } from '@angular/forms';

// export function uniqueNameValidator(showHidden: boolean = false): ValidatorFn {
//   return (formArray: AbstractControl): ValidationErrors | null => {
//     const names = new Set<string>();
//     let hasDuplicate = false;

//     (formArray as FormArray).controls.forEach(control => {
//       const name = control.get('name')?.value?.trim();
//       const paramType = control.get('paramType')?.value;

//       // Skip hidden parameters if showHidden is false
//       if (!showHidden && paramType === 'Private') {
//         control.get('name')?.setErrors(null);
//         return;
//       }

//       if (name) {
//         if (names.has(name)) {
//           control.get('name')?.setErrors({ duplicateName: true });
//           hasDuplicate = true;
//         } else {
//           names.add(name);
//           // Only clear duplicateName error if no other errors exist
//           const currentErrors = control.get('name')?.errors;
//           if (currentErrors && currentErrors['duplicateName']) {
//             delete currentErrors['duplicateName'];
//             control.get('name')?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
//           }
//         }
//       }
//     });

//     return hasDuplicate ? { duplicateName: true } : null;
//   };
// }



import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

export function uniqueNameValidator(showHidden: boolean = false): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    if (!(formArray instanceof FormArray)) return null;

    const names = new Set<string>();
    let hasDuplicate = false;

    (formArray as FormArray).controls.forEach(control => {
      const nameControl = control.get('name');
      if (!nameControl) return;

      const paramType = control.get('paramType')?.value;
      const scriptName = control.parent?.parent?.get('scriptName')?.value;
      const p = control.value;

      // Skip hidden/private parameters
      if (!showHidden && paramType === 'Private') {
        nameControl.setErrors(null);
        return;
      }

      // Skip duplicate check for your custom conditions
      if (p?.currentParameterObj?.isName || (scriptName !== 'Shared Parameters' && p?.isShared)) {
        nameControl.setErrors(null);
        return;
      }

      const name = nameControl.value?.trim();
      if (name) {
        if (names.has(name)) {
          nameControl.setErrors({ duplicateName: true });
          hasDuplicate = true;
        } else {
          names.add(name);

          // Clear previous duplicate error if no other errors exist
          const currentErrors = nameControl.errors;
          if (currentErrors?.['duplicateName']) {
            delete currentErrors['duplicateName'];
            nameControl.setErrors(
              Object.keys(currentErrors).length ? currentErrors : null
            );
          }
        }
      }
    });

    return hasDuplicate ? { duplicateName: true } : null;
  };
}




