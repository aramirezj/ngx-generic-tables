import { Component, ElementRef, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';




export interface Product {
  id: number;
  name: string;
  price: string;
  type: { id: number, name: string }
}


export interface TypeProduct {
  id:number,
  name:string
  products:Product[];
}

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.scss']
})
export class ComponentsComponent {
  elementRef: ElementRef = inject(ElementRef);

  products: Product[] = [
    { id: 1, name: 'Leather Sofa', price: '$999.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 2, name: 'Coffee Table', price: '$149.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 3, name: 'Dining Table', price: '$399.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 4, name: 'Bedroom Set', price: '$799.99', type: { id: 2, name: 'Outhouse furniture' } },
    { id: 5, name: 'Loveseat', price: '$449.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 6, name: 'Rug', price: '$99.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 7, name: 'Floor Lamp', price: '$69.99', type: { id: 2, name: 'Outhouse furniture' } }
  ];

  inhouseProducts:Product[] = [
    { id: 1, name: 'Leather Sofa', price: '$999.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 2, name: 'Coffee Table', price: '$149.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 3, name: 'Dining Table', price: '$399.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 5, name: 'Loveseat', price: '$449.99', type: { id: 1, name: 'Inhouse furniture' } },
    { id: 6, name: 'Rug', price: '$99.99', type: { id: 1, name: 'Inhouse furniture' } }
  ]

  outhouseProducts:Product[] = [
    { id: 4, name: 'Bedroom Set', price: '$799.99', type: { id: 2, name: 'Outhouse furniture' } },
    { id: 7, name: 'Floor Lamp', price: '$69.99', type: { id: 2, name: 'Outhouse furniture' } }
  ]

  typesProduct:TypeProduct[] = [
    {id:1,name:'Inhouse furniture',products:this.inhouseProducts},
    {id:2,name:'Outhouse furniture',products:this.outhouseProducts},

  ]


  typesModel:string[] = ['id','name'];
  typesVisual:string[] = ['Id.','Name'];
  
  productModel:string[] = ['id', 'name', 'price', 'type.name'];
  productVisual: string[] = ['Id.', 'Name', 'Price', 'Type'];
  tActionsLevels:string[][] = [[],['edit', 'autoDelete']];

  tModelTypes:string[][] = [this.typesModel,this.productModel];
  tVisualTypes:string[][] = [this.typesVisual,this.productVisual];

  levels:string[] = ['products'];



  tModel: string[] = ['id', 'name', 'price', 'type.name'];
  tVisual: string[] = ['Id.', 'Name', 'Price', 'Type'];
  tAction: string[] = ['edit', 'autoDelete'];

  ngAfterViewInit() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = 'assets/prism.js';
    this.elementRef.nativeElement.appendChild(s);
  }

  handleActions(event: { action: string, entity: Product }) {
    console.log('evento')
    console.log(event)
    switch(event.action){
      case 'autoDelete':
        //Your code for the delete api
        break;
      case 'edit':
        //Your code for opening a edit form and then the api
        break;
    }
  }

  handleActionsTypes(event:{action:string,root:TypeProduct, products:Product}){
    switch(event.action){
      case 'autoDelete':
        //Your code for the delete api
        break;
      case 'edit':
        //Your code for opening a edit form and then the api
        break;
    }
  }


}
