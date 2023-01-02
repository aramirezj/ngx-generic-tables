import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  GFFormService,
  GF_Form,
  GF_TypeForm,
} from 'projects/ngx-generic-tables/src/public-api';

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

  formService: GFFormService = inject(GFFormService);

  myForm: GF_Form<Persona> = new GF_Form(
    GF_TypeForm.CREATION,
    ['nombre', 'apellido'],
    ['Nombre', 'Apellido'],
    'Creating my form'
  );

  ngOnInit() {
    this.myForm.changeTypeForm(
      this.personas[0],
      GF_TypeForm.INSPECTION,
      'hehe'
    );
    /*this.formService.openForm(this.myForm).subscribe((valor) => {
      console.log(valor);
    });*/

    console.log(this.form.pristine);
    this.form.valueChanges.subscribe((valor) => {
      console.log(this.form.pristine);
    });
  }
}
