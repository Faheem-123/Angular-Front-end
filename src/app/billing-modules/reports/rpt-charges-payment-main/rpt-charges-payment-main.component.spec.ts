import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptChargesPaymentMainComponent } from './rpt-charges-payment-main.component';

describe('RptChargesPaymentMainComponent', () => {
  let component: RptChargesPaymentMainComponent;
  let fixture: ComponentFixture<RptChargesPaymentMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptChargesPaymentMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptChargesPaymentMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
