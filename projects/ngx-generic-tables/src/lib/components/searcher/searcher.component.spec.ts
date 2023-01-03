import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GTSearcherComponent } from './buscador.component';

describe('GTSearcherComponent', () => {
  let component: GTSearcherComponent;
  let fixture: ComponentFixture<GTSearcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GTSearcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GTSearcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
