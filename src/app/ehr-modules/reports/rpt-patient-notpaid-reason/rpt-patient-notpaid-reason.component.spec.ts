import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPatientNotpaidReasonComponent } from './rpt-patient-notpaid-reason.component';

describe('RptPatientNotpaidReasonComponent', () => {
  let component: RptPatientNotpaidReasonComponent;
  let fixture: ComponentFixture<RptPatientNotpaidReasonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPatientNotpaidReasonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPatientNotpaidReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
