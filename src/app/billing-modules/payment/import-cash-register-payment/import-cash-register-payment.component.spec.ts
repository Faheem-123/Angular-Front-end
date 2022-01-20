import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCashRegisterPaymentComponent } from './import-cash-register-payment.component';

describe('ImportCashRegisterPaymentComponent', () => {
  let component: ImportCashRegisterPaymentComponent;
  let fixture: ComponentFixture<ImportCashRegisterPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCashRegisterPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCashRegisterPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
