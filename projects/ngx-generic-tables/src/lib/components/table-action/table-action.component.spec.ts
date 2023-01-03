import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GTTableActionComponent } from './table-action.component';

describe('GTTableActionComponent', () => {
  let component: GTTableActionComponent;
  let fixture: ComponentFixture<GTTableActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GTTableActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GTTableActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
