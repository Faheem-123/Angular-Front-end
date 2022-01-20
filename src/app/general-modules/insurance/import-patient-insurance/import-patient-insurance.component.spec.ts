import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPatientInsuranceComponent } from './import-patient-insurance.component';

describe('ImportPatientInsuranceComponent', () => {
  let component: ImportPatientInsuranceComponent;
  let fixture: ComponentFixture<ImportPatientInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportPatientInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportPatientInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
