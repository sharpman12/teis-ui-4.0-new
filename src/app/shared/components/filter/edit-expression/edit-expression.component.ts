import { Component, Input, EventEmitter, Output, forwardRef } from '@angular/core';

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomInput } from '../base-classes/custom-input';

interface Isearch {
  id: string;
  message: string;
}

@Component({
  selector: 'app-edit-expression',
  templateUrl: './edit-expression.component.html',
  styleUrls: ['./edit-expression.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EditExpressionComponent),
    multi: true
  }]
})
export class EditExpressionComponent extends CustomInput {
  tagName: string;
  tagValue: string;
  validationResult = [];
  searchInputValue: string;
  displaySearch: string;
  isValidSearch: boolean;
  validateString: string;
  @Input() currentSearchType;
  @Input() currentSearchInput;
  @Output() readonly onblur: EventEmitter<any> = new EventEmitter();
  @Output() readonly inputValue: EventEmitter<string> = new EventEmitter();

 validateSearch(str): void {
  this.validateString = str;
    if (str) {
      const keyValPairs = str.replace(/(\r\n|\n|\r)/gm, '').split(/[&|]\s/);
      const validationStr = [
        {title: 'freetext=', regex: /.*?\S/gi},
        {title: 'taskid=', regex: /^[a-z0-9-]+$/g},
        {title: 'status=', regex: /\b(complete|error|active|hold|inputhold|done)\b/gm},
        {title: 'logtype=', regex: /\b(debug|info|warn|error)\b/gm}];
      if (keyValPairs && keyValPairs.length) {
        const colon = keyValPairs.filter(key => {
          if (key && key.indexOf('freetext=') === -1) {
            return (key && key.indexOf(':') !== -1);
          }

        });
        if (colon && colon.length) {
          const tagPair = colon[0].split(':');
          this.updateTagNameValue(tagPair[0], tagPair[1]);
        } else {
          keyValPairs.map((data, i) => {
            for (str of validationStr) {
              if (data && data.indexOf(str.title) === 0) {
                this.handleSearch(str, data, i);
              break;
              } else {
                this.validationFalse(false, 'Search text not valid');
              }
            }
          });
        }
      }
    } else  if (str === '') {
      this.validationFalse(true, '');
    } else {
      this.validationFalse(false, 'Search text not valid');
    }

  }

  updateTagNameValue(tagName, tagVal): any {
    this.handleTagEv(tagName);
    this.tagName = tagName;
    this.handleTagEv(tagVal);
    this.tagValue = tagVal;
    this.appendTagValues();
  }

  handleTagEv(value: any, index?: number) {
    const regex = /.*?/gi;
    this.handleEvCommonCall(regex, value , index);
  }

  handleSearch(obj, value, index): void {
    const tagValue = value.trim().slice(obj.title.length);
    this.handleEvCommonCall(obj.regex, tagValue, index);
    this.searchInputValue = value;
  }

  appendTagValues(index?: number) {
  if (!this.tagName || !this.tagValue) {
    this.searchInputValue = '';
    this.validationFalse(false, 'Search text not valid');
  }
  if ((this.tagName === '') && (this.tagValue === '')) {
    this.searchInputValue = '';
    this.displaySearch = '';
  } else {
    this.searchInputValue = this.tagName + ':' + this.tagValue;
  }
}

  handleEvCommonCall(regex, value, index?: number) {
    let m;
    while ((m = regex.exec(value))) {
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }

      m.forEach(() => {
        this.validationResult.splice(index, 1, true);
        if (this.validationResult.indexOf('false') === -1) {
          this.validationFalse(true, 'Valid search string');
        }
      });
    }
    if (!regex.exec(value)) {
      this.validationResult.splice(index, 1, false);
      this.validationFalse(false, 'Search text not valid');
    }
    if (!value) {
      this.displaySearch = '';
      this.validationFalse(true, '');
    }
  }

  validationFalse(isValidSearch, error) {
    this.isValidSearch = isValidSearch;
    this.displaySearch = error;
    this.onblur.emit({isValid: this.isValidSearch, display: this.displaySearch, searchInputValue: this.validateString});
  }
}
