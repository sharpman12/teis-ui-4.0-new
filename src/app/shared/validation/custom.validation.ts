import { UntypedFormArray } from '@angular/forms';

export class CustomValidator {
  static multipleCheckboxRequireOne(fa: UntypedFormArray) {
    let valid = false;
    for (let x = 0; x < fa.length; ++x) {
      if ((fa.at(x).value === true) || (fa.at(x).value === 'true')) {
        valid = true;
        break;
      }
    }
    return valid ? null : {
      multipleCheckboxRequireOne: true
    };
  }
}
