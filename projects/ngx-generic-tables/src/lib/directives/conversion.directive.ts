import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
} from '@angular/core';
import { GF_TypeConversion } from '../enums/TypeConversion';

/** Directive that can be applied to an form element to convert the value written by the user */
@Directive({ selector: '[gf-Conversion]', standalone: true })
export class GFConversionDirective {
  /** Type of conversion */
  @Input('gf-Conversion') type: GF_TypeConversion | string | undefined;
  /** The elementRef */
  private _el: ElementRef = inject(ElementRef);

  @HostListener('input', ['$event']) onInputChange(event): void {
    const initalValue: string = this._el.nativeElement.value;
    if (this.type) {
      switch (this.type) {
        case 'uppercase':
          this._el.nativeElement.value = initalValue.toUpperCase();
          break;
        case 'lowercase':
          this._el.nativeElement.value = initalValue.toLowerCase();
          break;
        case 'number':
          this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
          break;
        case 'space':
          this._el.nativeElement.value = initalValue.replace(/\s+/g, '');
          break;
        case 'uppercaseSpace':
          this._el.nativeElement.value = initalValue.toUpperCase().replace(/\s+/g, '');
          break;
        case 'lowercaseSpace':
          this._el.nativeElement.value = initalValue.toLowerCase().replace(/\s+/g, '');
          break;
      }
      if (initalValue !== this._el.nativeElement.value) event.stopPropagation();
    }
  }
}
