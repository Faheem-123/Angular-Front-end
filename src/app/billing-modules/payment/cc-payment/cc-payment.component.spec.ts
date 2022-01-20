import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcPaymentComponent } from './cc-payment.component';

describe('CcPaymentComponent', () => {
  let component: CcPaymentComponent;
  let fixture: ComponentFixture<CcPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
