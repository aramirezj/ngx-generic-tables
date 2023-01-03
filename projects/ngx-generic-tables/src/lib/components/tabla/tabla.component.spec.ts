import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GTTableComponent } from './tabla.component';

describe('GTTableComponent', () => {
  let component: GTTableComponent;
  let fixture: ComponentFixture<GTTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GTTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GTTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
