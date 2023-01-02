import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GFConfirmationComponent } from './confirmation.component';

describe('GFConfirmationComponent', () => {
  let component: GFConfirmationComponent;
  let fixture: ComponentFixture<GFConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GFConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GFConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
