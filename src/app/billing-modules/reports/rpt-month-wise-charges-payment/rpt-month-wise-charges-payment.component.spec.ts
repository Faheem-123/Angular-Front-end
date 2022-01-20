import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptMonthWiseChargesPaymentComponent } from './rpt-month-wise-charges-payment.component';

describe('RptMonthWiseChargesPaymentComponent', () => {
  let component: RptMonthWiseChargesPaymentComponent;
  let fixture: ComponentFixture<RptMonthWiseChargesPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptMonthWiseChargesPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptMonthWiseChargesPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
