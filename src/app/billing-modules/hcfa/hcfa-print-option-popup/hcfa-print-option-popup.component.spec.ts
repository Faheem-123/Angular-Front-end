import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HcfaPrintOptionPopupComponent } from './hcfa-print-option-popup.component';

describe('HcfaPrintOptionPopupComponent', () => {
  let component: HcfaPrintOptionPopupComponent;
  let fixture: ComponentFixture<HcfaPrintOptionPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HcfaPrintOptionPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HcfaPrintOptionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
