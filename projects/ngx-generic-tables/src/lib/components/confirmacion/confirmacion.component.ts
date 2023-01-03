import { DialogModule, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, OnInit, Inject } from '@angular/core';

/** Clase utilizada para mostrar un breve dialogo de confirmación */
@Component({
  selector: 'gt-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.scss'],
  standalone:true,
  imports:[DialogModule]
})
export class GTConfirmationComponent implements OnInit {
  /** Mensaje a mostrar */
  mensaje: string;
  /** Lista de opciones para crear dos botones */
  options: string[] | null = null;
  constructor(
    public dialogRef: DialogRef<string | boolean>,
    @Inject(DIALOG_DATA) public data
    ) {
      this.mensaje = data.mensaje;
     }

  ngOnInit(): void {
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
