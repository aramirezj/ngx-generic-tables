import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GTInfiniteTableComponent } from './tabla-infinita.component';

describe('GTInfiniteTableComponent', () => {
  let component: GTInfiniteTableComponent;
  let fixture: ComponentFixture<GTInfiniteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GTInfiniteTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GTInfiniteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
