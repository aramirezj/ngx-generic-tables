import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements AfterViewInit {

  elementRef:ElementRef = inject(ElementRef);

  ngAfterViewInit() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = 'assets/prism.js';
    this.elementRef.nativeElement.appendChild(s);
  }
}
