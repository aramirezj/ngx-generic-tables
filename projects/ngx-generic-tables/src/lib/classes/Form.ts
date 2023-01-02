import { ValidatorFn, Validators } from '@angular/forms';
import { GF_TypeControl } from '../enums/TypeControl';
import { GF_TypeForm } from '../enums/TypeForm';
import { GF_APIRequest } from './APIRequest';
import { GF_FormElement } from './FormElement';

/** If the form should shows buttons to execute functions */
export interface GF_ExtraAction {
  /** Label for the button */
  label: string;
  /** Function to execute */
  function: Function;
  /** If the action should close the form when it finish */
  close: boolean;
}

/** Class used for the management of generic and specific forms, shown later in GFGenericFormComponent */
export class GF_Form<T> {
  /** Element being treated in case the form is of type edition or inspection */
  entity: T;
  /** List of GF_FormElements to work with */
  controls: GF_FormElement[] = [];
  /** Original element, used in edition forms to keep track of the original element */
  originalEntity: T;
  /** Extra functions to be executed through buttons */
  extraActions: GF_ExtraAction[] = [];
  /** Request that the form could execute before it closes */
  APIRequest?: {
    creation?: GF_APIRequest;
    edition?: GF_APIRequest;
  } = {};

  constructor(
    /** Type of the form  */
    public type: GF_TypeForm,
    /** The model of the entity.  */
    public model: string[],
    /** The names to display in the controls of the form */
    public visual: string[],
    /** The title of the form */
    public title: string
  ) {
    this.model.forEach((atributo) =>
      this.addElement(
        atributo,
        new GF_FormElement(
          atributo,
          GF_TypeControl.TEXT,
          this.type === GF_TypeForm.INSPECTION
        )
      )
    );
    this.entity = {} as T;
    this.originalEntity = {} as T;
  }

  /**
   * REPLACE a list of validators, important, only replace, no concats.
   * @param validators Validators list
   * @param controlsName List with the name of the controls
   */
  setValidations(validators: ValidatorFn[], controlsName?: string[]): void {
    controlsName
      ? controlsName.forEach((atributo) =>
        this.getElement(atributo).control.setValidators(validators)
      )
      : this.model.forEach((atributo) =>
        this.getElement(atributo).control.setValidators(validators)
      );
  }

  /**
   * Set as required a list of controls
   *
   * @param controlsName Lista de controles. By default all form
   */
  setRequired(controlsName: string[] = this.model): void {
    controlsName.forEach((atributo) =>
      this.getElement(atributo).control.setValidators(Validators.required)
    );
  }

  /**
   * Recover a element of the form
   *
   * @param controlName Name of the control to get
   * @returns The form element
   */
  getElement(controlName: string): GF_FormElement {
    return this.controls[controlName];
  }

  /**
   * Add/Replace an element from the form
   *
   * @param controlName Name of the control
   * @param formElement Form element to add
   */
  addElement(controlName: string, formElement: GF_FormElement): GF_FormElement {
    this.controls[controlName] = formElement;
    return formElement;
  }

  /**
   * Add/Replace a list of elements
   *
   * @param nombre nombre del control del elemento
   * @param elemento elemento a insertar
   */
  addElements(controlsName: string[], formElements: GF_FormElement[]): void {
    let i: number = 0;
    controlsName.forEach((name) => {
      this.addElement(name, formElements[i]);
      i++;
    });
  }

  /**
   * Disable a list of controls
   *
   * @param controlsName List of names of the controls to disable
   */
  disableControls(controlsName: string[] = this.model): void {
    controlsName.forEach((atributo) => {
      this.getElement(atributo).disabled = true;
      this.getElement(atributo).control.disable();
    });
  }

  /**
   * Enable a list of controls
   *
   * @param controlsName List of names of the controls to enable. By default all the form
   */
  enableControls(controlsName: string[] = this.model): void {
    controlsName.forEach((atributo) => {
      this.getElement(atributo).control.enable();
      this.getElement(atributo).disabled = false;
    });
  }

  /**
   * Change the type of a list of controls
   *
   * @param type Type to change. EX: 'date | text | number | select | textArea | checkbox '
   * @param controlsName List of names of the controls
   */
  changeTypeControl(type: GF_TypeControl, controlsName: string[]): void {
    controlsName.forEach((atributo) => {
      if (this.getElement(atributo)) this.getElement(atributo).type = type;
    });
  }

  /**
   * Change the type of form
   *
   * @param elemento Element to assoc, by default is empty
   * @param tipo Type of form following the enum GF_TypeForm
   * @param titulo Title of the form. Used in the dialog
   */
  changeTypeForm(entity: T = {} as T, type?: GF_TypeForm, title?: string): void {
    if (this.type === GF_TypeForm.INSPECTION && type !== GF_TypeForm.INSPECTION) {
      for (const value of Object.values(this.controls)) {
        value.disabled = false;
        value.control.enable();
      }
    }
    if (type === GF_TypeForm.CREATION) this.entity = {} as T;
    else this.entity = entity ?? {} as T;
    this.type = type ?? this.type;
    this.title = title ?? this.title;
  }
}
