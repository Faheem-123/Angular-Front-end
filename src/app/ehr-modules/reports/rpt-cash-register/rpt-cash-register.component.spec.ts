import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptCashRegisterComponent } from './rpt-cash-register.component';

describe('RptCashRegisterComponent', () => {
  let component: RptCashRegisterComponent;
  let fixture: ComponentFixture<RptCashRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptCashRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptCashRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
