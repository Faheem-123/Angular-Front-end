import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptCptWisePaymentComponent } from './rpt-cpt-wise-payment.component';

describe('RptCptWisePaymentComponent', () => {
  let component: RptCptWisePaymentComponent;
  let fixture: ComponentFixture<RptCptWisePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptCptWisePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptCptWisePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
