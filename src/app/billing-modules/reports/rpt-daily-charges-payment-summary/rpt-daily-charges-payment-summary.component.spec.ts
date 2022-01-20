import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptDailyChargesPaymentSummaryComponent } from './rpt-daily-charges-payment-summary.component';

describe('RptDailyChargesPaymentSummaryComponent', () => {
  let component: RptDailyChargesPaymentSummaryComponent;
  let fixture: ComponentFixture<RptDailyChargesPaymentSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptDailyChargesPaymentSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptDailyChargesPaymentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
