import { Component, ElementRef, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';




export interface Product {
  id:number;
  name: string;
  price: string;
}

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss']
})
export class ComponentsComponent {
  elementRef: ElementRef = inject(ElementRef);
  form:FormGroup = new FormGroup({product:new FormControl()})
  products: Product[] = [
    { id: 1, name: 'Leather Sofa', price: '$999.99' },
    { id: 2, name: 'Coffee Table', price: '$149.99' },
    { id: 3, name: 'Dining Table', price: '$399.99' },
    { id: 4, name: 'Bedroom Set', price: '$799.99' },
    { id: 5, name: 'Loveseat', price: '$449.99' },
    { id: 6, name: 'Rug', price: '$99.99' },
    { id: 7, name: 'Floor Lamp', price: '$69.99' },
    { id: 8, name: 'Bookcase', price: '$199.99' },
    { id: 9, name: 'Accent Chair', price: '$129.99' },
    { id: 10, name: 'Outdoor Patio Set', price: '$799.99' }
  ];
  ngAfterViewInit() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = 'assets/prism.js';
    this.elementRef.nativeElement.appendChild(s);
  }
}
