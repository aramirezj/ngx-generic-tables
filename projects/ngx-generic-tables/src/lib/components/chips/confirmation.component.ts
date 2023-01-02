import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import {  ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validators } from '@angular/forms';
import { GFTranslatePipe } from '../../directives/translate.directive';

/** Control for showing some chips with a Yes/No */
@Component({
  selector: 'gf-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GFConfirmationComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: GFConfirmationComponent
    }
  ],
  standalone: true,
  imports: [CommonModule, GFTranslatePipe],
})
export class GFConfirmationComponent implements ControlValueAccessor {
  /** Description of the control */
  @Input() description: string | undefined;
  /** Para saber si está deshabilitado */
  disabled: boolean = false;
  /** Valor actual del control */
  field: boolean | null = null;
  /** Trigger de cuando cambia el valor */
  onChanged: any = () => { };
  /** Trigger de cuando se toca el control */
  onTouched: any = () => { };
  /** To know if the field has been required */
  isRequired: boolean = false;
  /** To keep record if the field is in an error state */
  errorState: boolean = false;

  /** Setter del valor */
  set value(val: boolean | null) {
    this.field = val;
    this.onChanged(val);
    this.onTouched(val);
  }

  /**
  * Function that can be use to customize the validation and also retrieve the control
  * So in this case, we use it to know if our control is required
  * @param controlLinked Control
  * @returns Null
  */
  public validate(controlLinked: FormControl): ValidationErrors | null {
    this.isRequired = controlLinked.hasValidator(Validators.required);
    return null;
  }


  /** Seteo del valor */
  writeValue(value: boolean | null): void {
    // Si se ha seleccionado el mismo, deseleccionamos
    value = this.field === value ? null : value;
    this.value = value;
    this.onTouched();
    this.checkRequired();
  }

  /** Registra los cambios */
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  /** If its required and the user deselects */
  checkRequired() {
    this.errorState = this.field === null && this.isRequired;

  }

  /** Registra el touched */
  registerOnTouched(onTouched: Function): void {
    this.onTouched = onTouched;
  }

  /** Assocs the disabled */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }


}
