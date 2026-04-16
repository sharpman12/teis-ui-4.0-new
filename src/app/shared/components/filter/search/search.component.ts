import { Component, Input, EventEmitter, Output, forwardRef } from '@angular/core';


import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomInput } from '../base-classes/custom-input';

interface Isearch {
  id: string;
  message: string;
}
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchComponent),
    multi: true
  }]
})
export class SearchComponent extends CustomInput {
  public showSearchTextMenu = true;
  public taskId: string;

  showModalSearch: boolean;
  isValidSearch: boolean;
  displaySearch: string;
  selectedSearch: Isearch;
  searches: Isearch[];
  validationResult = [];
  searchInputValue: string; // update prefix val
  tagName: string;
  tagValue: string;
  isReadOnlySearchText: boolean;
  TagNameInput;
  TagValueInput;
  @Input() currentSearchType;
  @Input() currentSearchInput;
  @Output() readonly onblur: EventEmitter<any> = new EventEmitter();
  @Output() readonly searchType: EventEmitter<Isearch> = new EventEmitter();
  @Output() readonly searchValue: EventEmitter<string> = new EventEmitter();
  @Output() readonly inputValue: EventEmitter<string> = new EventEmitter();

  ngOnInit() {
    this.selectedSearch = this.currentSearchType;
    this.searchType.emit(this.selectedSearch);
    this.searches = [
      { 'message': 'Text', id: 'freeText' },
      { 'message': 'TaskId', id: 'taskId' },
      { 'message': 'TagValue ', id: 'tag' }
    ];
    if (this.selectedSearch.id === 'tag') {
      const str = this.currentSearchInput.split(":");
      this.TagNameInput = str[0];
      this.TagValueInput = str[1];
    }

  }

  ngOnChanges() {
    this.selectedSearch = this.currentSearchType;
  }

  openSearchTimeMenu() {
    this.showSearchTextMenu = !this.showSearchTextMenu;
  }

  hideSearchPopUp() {
    this.showModalSearch = false;
    this.selectedSearch = { 'message': 'Text', 'id': 'freeText' };
    this.searchInputValue = '';
  }

  getSearchText(search) {
    this.openSearchTimeMenu();
    this.searchInputValue = '';
    this.displaySearch = '';
    this.selectedSearch = search;
    this.searchType.emit(search);
    this.searchValue.emit(this.searchInputValue);
    this.inputValue.emit('');
  }

  updateTagName(tagName: any, index?: number) {
    this.handleTagEv(tagName);
    this.tagName = tagName;
    this.appendTagValues();
  }

  updateTagValue(tagValue: any, index?: number) {
    this.handleTagEv(tagValue);
    this.tagValue = tagValue;
    this.appendTagValues();

  }

  appendTagValues(index?: number) {
    if (!this.tagName || !this.tagValue) {
      this.searchInputValue = '';
      this.validationFalse(false, 'Search text not valid');
    }
    if ((this.tagName == '') && (this.tagValue == '')) {
      this.searchInputValue = '';
      this.displaySearch = '';
    } else {
      this.searchInputValue = this.tagName + ':' + this.tagValue;
      let search = this.tagName + ':' + this.tagValue;
      this.searchValue.emit(search);
      this.inputValue.emit(search);
    }


  }
  updateTaskId(value: any, index?: number) {
    this.handleTaskIdEv(value);
  }

  updateFreeText(value: any, index?: number) {
    this.handleFreeTextEv(value);
  }

  handleTaskIdEv(value: any, index?: number) {
    const regex = /^[a-z0-9-]+$/g;
    this.handleEvCommonCall(regex, value, index);
    this.searchInputValue = value ? `taskid=${value}` : value;
    this.searchValue.emit(this.searchInputValue);
    this.inputValue.emit(value);
  }

  handleStatus(value: any, index?: number) {
    const regex = /\b(complete|error|active|hold|inputhold|done)\b/gm;
    this.handleEvCommonCall(regex, value, index);
    this.searchInputValue = value ? `status=${value}` : value;
    this.searchValue.emit(this.searchInputValue);
    this.inputValue.emit(value);
  }
  handleLogType(value: any, index?: number) {
    const regex = /\b(debug|info|warn|error)\b/gm;
    this.handleEvCommonCall(regex, value, index);
    this.searchInputValue = value ? `logtype=${value}` : value;
    this.searchValue.emit(this.searchInputValue);
    this.inputValue.emit(value);
  }
  handleTagEv(value: any, index?: number) {
    const regex = /.*?/gi;
    this.handleEvCommonCall(regex, value, index);
    this.inputValue.emit(value);
  }

  handleFreeTextEv(value: any, index?: number) {
    const regex = /.*?\S/gi;
    this.handleEvCommonCall(regex, value, index);
    this.searchInputValue = value ? `freetext=${value}` : value;
    this.searchValue.emit(this.searchInputValue);
    this.inputValue.emit(value);
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
    this.onblur.emit({ isValid: this.isValidSearch, display: this.displaySearch });
  }

  closePopUp(value) {
    this.searchInputValue = value;
    this.isReadOnlySearchText = false;
    this.showModalSearch = false;
  }
}
