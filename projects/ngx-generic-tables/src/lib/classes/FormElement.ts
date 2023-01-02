import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { GF_TypeControl } from '../enums/TypeControl';
/** The reference of a element of a form, a control */
export class GF_FormElement {
  /** FormControl binded to the element */
  control: FormControl;
  constructor(
    /** Identifier name of the form element */
    public name: string,
    /** Type of control. By default text */
    public type: GF_TypeControl = GF_TypeControl.TEXT,
    /** If the control is disabled */
    public disabled: boolean = false,
    /** If its a select, can have the observable of the information of the list */
    public list?: Observable<any> | any[],
    /** If select, and if object, where should get the info to display */
    public label?: string,
    /** If select, and if object, second label */
    public secondLabel?: string,
    /** If select, and if object, what info should retrieve, if null, retrieves the whole object */
    public model?: string,
    /** If select, if it can use multiple object */
    public multiple?: boolean,
    /** If select, and if object, whats the key of the object */
    public key?: string
  ) {
    this.type = this.type ?? GF_TypeControl.TEXT;
    this.control = new FormControl({ value: null, disabled: this.disabled });
  }
}
