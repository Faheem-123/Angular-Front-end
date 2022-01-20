import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferClaimPostedPatientPaymentComponent } from './transfer-claim-posted-patient-payment.component';

describe('TransferClaimPostedPatientPaymentComponent', () => {
  let component: TransferClaimPostedPatientPaymentComponent;
  let fixture: ComponentFixture<TransferClaimPostedPatientPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferClaimPostedPatientPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferClaimPostedPatientPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
