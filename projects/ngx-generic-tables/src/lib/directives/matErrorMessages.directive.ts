import { Component, AfterViewInit, inject, Injector, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { MatFormField, MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Res } from './res';
/** Directive of component that can be added to a mat-error and it will display automatically error messages */
@Component({
  selector: '[gf-matErrorMessages]',
  template: '{{ error }}',
  standalone: true,
  imports: [MatFormFieldModule]
})
export class GFMatErrorMessagesDirective implements AfterViewInit {
  /** Error to display */
  error:string = '';
  /** Reference in the dom */
  inputRef!: MatFormFieldControl<MatInput>;

  _inj:Injector = inject(Injector)
  locale:string = inject(LOCALE_ID);
  cdRef:ChangeDetectorRef = inject(ChangeDetectorRef);

  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }
  ngAfterViewInit() {
    
    const container = this._inj.get(MatFormField);
    this.inputRef = container._control;

    // Asigno el cambio de estado a la función
    this.inputRef.ngControl?.statusChanges?.subscribe(this.updateErrors);
    this.updateErrors('INVALID');
  }

  /**
   * Función que controla los errores según cambia el estado
   *
   * @param state
   */
  private updateErrors = (state: 'VALID' | 'INVALID') => {
    if (state === 'INVALID') {
      const controlErrors = this.inputRef.ngControl?.errors ?? {} as any;
      const firstError = controlErrors ? Object.keys(controlErrors)[0] : null;
      switch (firstError) {
        case 'required':
          this.error = Res.Get('REQUIRED',this.locale);
          break;
        case 'minlength':
          this.error = `${Res.Get('MINLENGTH',this.locale)}${controlErrors?.minlength?.requiredLength}${Res.Get('CHARACTERS',this.locale)}`;
          break;
        case 'maxlength':
          this.error = `${Res.Get('MAXLENGTH',this.locale)}${controlErrors?.maxlength?.requiredLength}${Res.Get('CHARACTERS',this.locale)}`;
          break;
        case 'min':
          this.error = `${Res.Get('MIN',this.locale)}${controlErrors?.min?.min.toFixed(2)}.`;
          break;
        case 'max':
            this.error = `${Res.Get('MAX',this.locale)}${controlErrors?.max?.max.toFixed(2)}.`;
          break;
        case 'email':
          this.error = Res.Get('EMAIL',this.locale)
          break;
        case 'incorrect':
          this.error = Res.Get('INCORRECT',this.locale)
          break;
        case 'numberRange':
          this.error = Res.Get('NUMBERRANGE',this.locale)
          break;
      }
    }
  }
}
