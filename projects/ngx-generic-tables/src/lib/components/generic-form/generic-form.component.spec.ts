import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GFGenericFormComponent } from './generic-form.component';

describe('GFGenericFormComponent', () => {
  let component: GFGenericFormComponent<any>;
  let fixture: ComponentFixture<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GFGenericFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GFGenericFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
