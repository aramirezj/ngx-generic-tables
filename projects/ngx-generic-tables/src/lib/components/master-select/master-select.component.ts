import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GFMatErrorMessagesDirective } from '../../directives/matErrorMessages.directive';
import { GFTranslatePipe } from '../../directives/translate.directive';

/** Control component that can receive a list or an observable that retrieves a list and will display a select based component
 * Can be configurated through multiple inputs
 */
@Component({
  selector: 'gf-master-select',
  templateUrl: './master-select.component.html',
  styleUrls: ['./master-select.component.scss'],
  imports: [CommonModule, MatSelectModule,GFTranslatePipe, MatFormFieldModule, GFMatErrorMessagesDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GFMasterSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: GFMasterSelectComponent
    }
  ],
  standalone: true,
})
export class GFMasterSelectComponent implements ControlValueAccessor, Validator {
  @ViewChild(MatSelect, { static: false }) matSelect!: MatSelect;
  /** Data received */
  @Input() set data(data: any[] | Observable<any>) {
    this._data = data ?? [];
    this.triggerSource.next(1);
  }

  /** Source data */
  @Input() _data: any[] | Observable<any> = [];
  /** If the source data are objects, and this is setted, it will retrieve the property of the object. If not, the select will retrieve the whole object */
  @Input() model: string | undefined;
  /** If the source data are objects, it will be neccesary to get the property that is gonna be used to display information */
  @Input() label: string | undefined;
  /** If the source data are objects, it can be used to get a second property that is gonna be used to display information */
  @Input() secondLabel: string | undefined;
  /** Placeholder that will be displayed */
  @Input() placeholder: string | undefined;
  /** Extra information   */
  @Input() hint: string = '';
  /** To control if the input search should be displayed or not */
  @Input() searcher: boolean = true;
  /** To control if the select can accept multiple choices */
  @Input() multiple: boolean = false;
  /** To give a custom function search. The params in the function has to be (term: string, item: any) */
  @Input() customSearch: any;
  /** If the source data are objects, it can be used to specify a primary key so it can compare the item faster */
  @Input() key: string | undefined;
  /** To assign the id so it can be used later for the compareObjects */
  public idSelect: string | undefined = undefined;
  /** Para reiniciar el origen de data **/
  private triggerSource = new Subject<number>();
  /** Source data, now always an array */
  private dataList: any[] = [];
  /** To know if the control is disabled */
  disabled: boolean = false;
  /** To show the option to deselect */
  showDeselect: boolean = false;
  /** Data already filtered */
  protected filteredData: any[] = [];
  /** To know if the control is required */
  protected isRequired: boolean = false;
  /** To keep the errorState for the mat-error */
  protected errorState: boolean = false;
  /** Setter del valor */
  set value(val: any) {
    this.field = val;
    this.onChanged(val);
    this.onTouched(val);
    this.checkRequired()
  }

  /** Current value */
  field: any;
  /** To trigger change event */
  onChanged: any = () => { };
  /** To trigger touched event */
  onTouched: any = () => { };


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

  /** Seteo del valor al clicar */
  writeValue(value: any): void {
    this.value = value;
    setTimeout(() => {
      this.showDeselect = !!this.field;
    }, 400);
  }

  // This three functions associate the angular valueaccesor to our triggers
  /** Asocc change */
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  /** Asocc touched */
  registerOnTouched(onTouched: Function): void {
    this.onTouched = onTouched;
  }

  /** Asocc disabled */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit() {
    // If this has a model, we dont need the key
    if (this.model) this.key = undefined;
    // If key, we build the id for the compareObject
    if (this.key) this.idSelect = `gf-${this.key}`;
    this.processSourceData();
    this.triggerSource.subscribe(() => this.processSourceData());
  }

  /** Process the source data, if its an observable it will execute it */
  private processSourceData(): void {
    if (Array.isArray(this._data)) {
      if (typeof this._data[0] === 'object' && !this.label) {
        // Si es un array the objetos y el usuario no ha puesto label, se verá Object object por lo que lanzamos una excepción
        throw new Error('If gf-master-select receives an array of objects, you have to pass the input parameter "label" so it can show a field of the object in the options');
      }
      this.dataList = this._data;
      this.filteredData = this.dataList;
    } else {
      this._data.subscribe((data) => {
        this.dataList = data;
        this.filteredData = this.dataList;
      });
    }
  }

  /** Trigger of toggle to restart the filter data and trigger the touched */
  protected toggledSelect(): void {
    this.filteredData = this.dataList.slice();
    this.onTouched();
    this.checkRequired();
  }

  /** If is required and we dont have value, we mark an error */
  private checkRequired() {
    this.errorState = !this.field && this.isRequired
    if (this.matSelect) this.matSelect.errorState = this.errorState;
  }

  /**
   * Search function, if it had a custom it will used it, if not, try to filter from the label and second
   * @param value Valor escrito
   */
  search(term: string): void {
    if (this.customSearch) {
      // Es una busqueda customizadas, por lo que en el segundo parametro pasamos la query
      this.filteredData = this.dataList.filter(
        this.customSearch.bind(null, term)
      );
    } else {
      const toFilter: string = term.toString().toLowerCase();
      if (!this.label) {
        this.filteredData = this.dataList.filter((option) => option.toString().toLowerCase().indexOf(toFilter.toString()));
      } else if (this.label && !this.secondLabel) {
        this.filteredData = this.dataList.filter((option) =>
          this.label
            ? option[this.label].toLowerCase().indexOf(toFilter) > -1
            : option.toString().toLowerCase().indexOf(toFilter.toString()) > -1
        );
      } else {
        this.filteredData = this.dataList.filter(
          (option) =>
            option[this.label as string]?.toLowerCase().indexOf(toFilter) > -1 ||
            option[this.secondLabel as string]?.toLowerCase().indexOf(toFilter) > -1
        );
      }

    }
  }

  /**
   * Function to compare two objects. If there is a key, it will try to use it, if not, json whole object
   * @param o1 Object 1
   * @param o2 Objet 2 (Selected)
   * @returns If they are the same
   */
  protected compareObjects(o1: any, o2: any): boolean {
    const selectHmtl: any = this;
    let key: string | null = selectHmtl.id;
    if (key) { key = key.substring(0, 3) === 'gf-' ? key.slice(3, key.length) : null; }
    if (o1 && o2) {
      if (key) {
        if (o1[key] !== undefined && o1[key] !== null) {
          return o1[key] === o2[key];
        } else {
          return false;
        }
      } else {
        return JSON.stringify(o1) === JSON.stringify(o2);
      }
    } else {
      return false;
    }
  }
}


