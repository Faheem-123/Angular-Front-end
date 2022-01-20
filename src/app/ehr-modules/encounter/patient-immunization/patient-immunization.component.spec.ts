import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientImmunizationComponent } from './patient-immunization.component';

describe('PatientImmunizationComponent', () => {
  let component: PatientImmunizationComponent;
  let fixture: ComponentFixture<PatientImmunizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientImmunizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientImmunizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
