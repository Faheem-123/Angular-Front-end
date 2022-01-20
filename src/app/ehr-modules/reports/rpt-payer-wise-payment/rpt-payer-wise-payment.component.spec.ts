import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPayerWisePaymentComponent } from './rpt-payer-wise-payment.component';

describe('RptPayerWisePaymentComponent', () => {
  let component: RptPayerWisePaymentComponent;
  let fixture: ComponentFixture<RptPayerWisePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPayerWisePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPayerWisePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
