import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPaymentMainComponent } from './patient-payment-main.component';

describe('PatientPaymentMainComponent', () => {
  let component: PatientPaymentMainComponent;
  let fixture: ComponentFixture<PatientPaymentMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientPaymentMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPaymentMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
