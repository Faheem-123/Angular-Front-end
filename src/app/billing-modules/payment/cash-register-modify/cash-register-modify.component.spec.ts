import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegisterModifyComponent } from './cash-register-modify.component';

describe('CashRegisterModifyComponent', () => {
  let component: CashRegisterModifyComponent;
  let fixture: ComponentFixture<CashRegisterModifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashRegisterModifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashRegisterModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
