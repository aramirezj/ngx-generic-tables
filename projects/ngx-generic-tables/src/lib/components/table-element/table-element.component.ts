import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';


/** Its equivalent to a TD of a table. Will receive the final value and evalue the format */
@Component({
  selector: 'gt-table-element',
  templateUrl: './table-element.component.html',
  styleUrls: ['./table-element.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class GTTableElementComponent implements OnInit {
  /** Elemento a tratar */
  @Input() field: any;
  /** Formato del field */
  @Input() format: string = 'text';

  ngOnInit(): void {
    this.prepararElemento();
  }

  ngOnChanges(change: SimpleChange) {
    if (!change.firstChange) this.prepararElemento();
  }
  /**
   * Asignación del formato necesario según el contenido del elemento
   *
   * @param forzar Si se ha modificado el field, se fuerza otra comprobación
   */
  prepararElemento(): void {
    if (this.field !== undefined && this.field !== null) {
      if (!this.format) {
        if (this.coerceBoolean(this.field)) {
          this.format = 'boolean'
        } else if (/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/]\d{4}$/.test(this.field)) {
          this.format = 'texto';
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(this.field)) {
          this.format = 'date';
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:(?:\+\d{2}:\d{2})|Z)$/.test(this.field)) {
          this.format = 'dateTime';
        }
      }
    }
  }

  /**
   * Accesor for the boolean so it can be used in the view and in the component
   * @param value 
   * @returns 
   */
  public coerceBoolean(value: any): boolean {
    return coerceBooleanProperty(value);
  }
}
