import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPatientEligibilityComponent } from './rpt-patient-eligibility.component';

describe('RptPatientEligibilityComponent', () => {
  let component: RptPatientEligibilityComponent;
  let fixture: ComponentFixture<RptPatientEligibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPatientEligibilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPatientEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
