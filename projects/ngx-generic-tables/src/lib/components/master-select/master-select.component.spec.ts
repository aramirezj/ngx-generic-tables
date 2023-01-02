import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GFMasterSelectComponent } from './master-select.component';

describe('GFMasterSelectComponent', () => {
  let component: GFMasterSelectComponent;
  let fixture: ComponentFixture<GFMasterSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GFMasterSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GFMasterSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
