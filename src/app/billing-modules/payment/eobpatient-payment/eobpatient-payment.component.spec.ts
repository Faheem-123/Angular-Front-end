import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EOBPatientPaymentComponent } from './eobpatient-payment.component';

describe('EOBPatientPaymentComponent', () => {
  let component: EOBPatientPaymentComponent;
  let fixture: ComponentFixture<EOBPatientPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EOBPatientPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EOBPatientPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
