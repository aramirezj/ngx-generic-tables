import { DialogModule, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { GTTranslatePipe } from '../../directives/translate.directive';

/** Clase utilizada para mostrar un breve dialogo de confirmación */
@Component({
  selector: 'gt-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.scss'],
  standalone: true,
  imports: [DialogModule, GTTranslatePipe]
})
export class GTConfirmationComponent {
  /** Mensaje a mostrar */
  mensaje: string;
  constructor(
    public dialogRef: DialogRef<string | boolean>,
    @Inject(DIALOG_DATA) public data
  ) {
    this.mensaje = data.message;
  }

  /** Confirmación del dialogo */
  save(option?: string): void {
    this.dialogRef.close(option ?? true);
  }
  /** Cancelación del dialogo */
  close(): void {
    this.dialogRef.close();
  }

}
