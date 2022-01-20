import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInsuranceAddEditPopupComponent } from './patient-insurance-add-edit-popup.component';

describe('PatientInsuranceAddEditPopupComponent', () => {
  let component: PatientInsuranceAddEditPopupComponent;
  let fixture: ComponentFixture<PatientInsuranceAddEditPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientInsuranceAddEditPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceAddEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
