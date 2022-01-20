import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientClaimReceiptPrintComponent } from './patient-claim-receipt-print.component';

describe('PatientClaimReceiptPrintComponent', () => {
  let component: PatientClaimReceiptPrintComponent;
  let fixture: ComponentFixture<PatientClaimReceiptPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientClaimReceiptPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientClaimReceiptPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
