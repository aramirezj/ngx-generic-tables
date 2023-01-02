import { inject, Pipe, PipeTransform } from '@angular/core';
import { Res } from './res';
import { LOCALE_ID } from '@angular/core';

/** Directive used to translate the text */
@Pipe({ name: 'translate', standalone: true })
export class GFTranslatePipe implements PipeTransform {
  locale:string = inject(LOCALE_ID);
  /** From the key of the text, with the locale, return the traslated */
  transform(original: string): string {
    return Res.Get(original, this.locale);
  }
}