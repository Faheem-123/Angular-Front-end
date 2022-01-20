import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundPatientPaymentComponent } from './refund-patient-payment.component';

describe('RefundPatientPaymentComponent', () => {
  let component: RefundPatientPaymentComponent;
  let fixture: ComponentFixture<RefundPatientPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundPatientPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundPatientPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
