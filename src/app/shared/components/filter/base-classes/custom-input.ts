import { ControlValueAccessor } from '@angular/forms';

const noop = () => { };

export class CustomInput implements ControlValueAccessor {

  // The internal data model
  private innerValue: any = '';

  // Placeholders for the callbacks which are later provided
  // by the Control Value Accessor
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  // get accessor
  get value(): any {
    return this.innerValue;
  }

  // set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  // Set touched on blur
  onBlur(): void {
    this.onTouchedCallback();
  }

  // From ControlValueAccessor interface
  writeValue(value: any): void {
    if (value !== this.innerValue) {
      // for date component
      this.innerValue = value === undefined ? '' : value;
    }
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

}
