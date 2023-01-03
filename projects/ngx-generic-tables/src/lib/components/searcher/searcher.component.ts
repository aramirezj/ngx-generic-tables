import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';


/** Componente encargado de mostrar un formulario de busqueda */
@Component({
  selector: 'gt-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule]
})
export class GTSearcherComponent {
  /** Notification with what the user wrote */
  @Output() public toSearch: EventEmitter<string> = new EventEmitter<string>();
  /** GTForm para el buscador simple */
  public control:FormControl = new FormControl();

  /**
  * Envio de la busqueda
  * @param valor Valor sobre el que filtrar
  */
  protected search(valor: string): void {
    if (valor) valor = valor.toLowerCase();
    this.toSearch.emit(valor);
  }

}