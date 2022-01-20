import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPaymentCollectionComponent } from './rpt-payment-collection.component';

describe('RptPaymentCollectionComponent', () => {
  let component: RptPaymentCollectionComponent;
  let fixture: ComponentFixture<RptPaymentCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPaymentCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPaymentCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
