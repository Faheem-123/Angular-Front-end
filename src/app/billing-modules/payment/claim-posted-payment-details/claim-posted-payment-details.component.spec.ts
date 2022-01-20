import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPostedPaymentDetailsComponent } from './claim-posted-payment-details.component';

describe('ClaimPostedPaymentDetailsComponent', () => {
  let component: ClaimPostedPaymentDetailsComponent;
  let fixture: ComponentFixture<ClaimPostedPaymentDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimPostedPaymentDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimPostedPaymentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
