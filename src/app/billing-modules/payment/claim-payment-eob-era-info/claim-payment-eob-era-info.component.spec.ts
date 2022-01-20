import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPaymentEobEraInfoComponent } from './claim-payment-eob-era-info.component';

describe('ClaimPaymentEobEraInfoComponent', () => {
  let component: ClaimPaymentEobEraInfoComponent;
  let fixture: ComponentFixture<ClaimPaymentEobEraInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimPaymentEobEraInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimPaymentEobEraInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
