import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GFGenericFormComponent } from './components/generic-form/generic-form.component';
import { GF_Form } from './classes/Form';

/** Service for the form utilies */
@Injectable({ providedIn: 'root' })
export class GFFormService {
  /** Reference of the dialog */
  private readonly dialog: Dialog = inject(Dialog);

  /**
   * Open the GenericForm component with a form
   * @param form Form to open
   * @param minWidth Width of the dialog with the form
   * @returns An entity of the form
   */
  openForm(form: GF_Form<any>, minWidth: string = '35vw'): Observable<any> {
    const dialogRef = this.dialog.open(GFGenericFormComponent, {
      data: form,
      minWidth,
    });
    return dialogRef.closed;
  }
}
