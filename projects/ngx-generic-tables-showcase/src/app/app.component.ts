import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface Persona {
  id?:number;
  nombre: string;
  apellido: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  personas: Persona[] = [
    { nombre: 'alej', apellido: 'ram' },
    { nombre: 'emily', apellido: 'alvi' }
  ];

  form: FormGroup = new FormGroup({
    conf: new FormControl(true, Validators.required),
    edad: new FormControl(
      { value: null, disabled: false },
      Validators.required
    ),
  });





  ngOnInit() {

    /*this.formService.openForm(this.myForm).subscribe((valor) => {
      console.log(valor);
    });*/

    console.log(this.form.pristine);
    this.form.valueChanges.subscribe((valor) => {
      console.log(this.form.pristine);
    });
  }
}
