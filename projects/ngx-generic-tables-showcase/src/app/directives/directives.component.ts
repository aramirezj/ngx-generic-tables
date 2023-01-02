import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-directives',
  templateUrl: './directives.component.html',
  styleUrls: ['./directives.component.scss']
})
export class DirectivesComponent implements AfterViewInit {

  elementRef: ElementRef = inject(ElementRef);
  form:FormGroup = new FormGroup({email: new FormControl(null,[Validators.required,Validators.minLength(3),Validators.email])});
  ngAfterViewInit() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = 'assets/prism.js';
    this.elementRef.nativeElement.appendChild(s);
  }


}
