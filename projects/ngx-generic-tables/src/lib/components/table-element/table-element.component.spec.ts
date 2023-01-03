import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GTTableElementComponent } from './table-element.component';

describe('GTTableElementComponent', () => {
  let component: GTTableElementComponent;
  let fixture: ComponentFixture<GTTableElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GTTableElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GTTableElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
