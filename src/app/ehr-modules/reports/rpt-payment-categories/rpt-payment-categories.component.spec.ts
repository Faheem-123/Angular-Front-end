import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPaymentCategoriesComponent } from './rpt-payment-categories.component';

describe('RptPaymentCategoriesComponent', () => {
  let component: RptPaymentCategoriesComponent;
  let fixture: ComponentFixture<RptPaymentCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPaymentCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPaymentCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
