import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegisterPrintComponent } from './cash-register-print.component';

describe('CashRegisterPrintComponent', () => {
  let component: CashRegisterPrintComponent;
  let fixture: ComponentFixture<CashRegisterPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashRegisterPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashRegisterPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
