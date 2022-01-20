import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptDailyPaymentSummaryComponent } from './rpt-daily-payment-summary.component';

describe('RptDailyPaymentSummaryComponent', () => {
  let component: RptDailyPaymentSummaryComponent;
  let fixture: ComponentFixture<RptDailyPaymentSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptDailyPaymentSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptDailyPaymentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
