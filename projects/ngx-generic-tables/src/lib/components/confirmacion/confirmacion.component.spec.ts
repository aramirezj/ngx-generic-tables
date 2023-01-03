import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GTConfirmationComponent } from './confirmacion.component';

describe('GTConfirmationComponent', () => {
  let component: GTConfirmationComponent;
  let fixture: ComponentFixture<GTConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GTConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GTConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
