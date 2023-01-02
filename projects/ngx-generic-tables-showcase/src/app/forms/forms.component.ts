import { AfterViewChecked, Component, ElementRef, inject } from '@angular/core';
import { GFFormService, GF_Form, GF_FormElement, GF_TypeControl, GF_TypeForm } from 'projects/ngx-generic-tables/src/public-api';

@Component({
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent {
  formService: GFFormService = inject(GFFormService);
  elementRef:ElementRef = inject(ElementRef);
  formProduct: GF_Form<any> = new GF_Form(GF_TypeForm.CREATION, ['code', 'name', 'type', 'stock'], ['Code', 'Full name', 'Type', 'Stock'], 'Creating a product');
  types: any[] = [{ id: 1, name: 'Furniture' }, { id: 2, name: 'Food' }, { id: 3, name: 'Drink' }, { id: 4, name: 'Clothes' }]
  customProduct: any;



  ngAfterViewInit() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = 'assets/prism.js';
    this.elementRef.nativeElement.appendChild(s);
  }

  ngOnInit() {
    this.customProduct = { code: 'AGR002', name: 'An amazing chair', type: this.types[0].id, stock: 54 };

    this.formProduct.changeTypeControl(GF_TypeControl.NUMBER, ['stock']);
    this.formProduct.addElement('type', new GF_FormElement('type', GF_TypeControl.SELECTMASTER, false, this.types, 'name', undefined, 'id'));
    this.formProduct.setRequired(['name', 'type']);
  }


  createProduct() {
    this.formProduct.changeTypeForm(null, GF_TypeForm.CREATION, 'Create a product');
    this.formService.openForm(this.formProduct).subscribe();
  }

  editProduct() {
    this.formProduct.changeTypeForm(this.customProduct, GF_TypeForm.EDITION, 'Editing a product');
    this.formService.openForm(this.formProduct).subscribe();
  }

  inspectProduct() {
    this.formProduct.changeTypeForm(this.customProduct, GF_TypeForm.INSPECTION, 'Inspecting a product');
    this.formService.openForm(this.formProduct).subscribe();
  }
}
