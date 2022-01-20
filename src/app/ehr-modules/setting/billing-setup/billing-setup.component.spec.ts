import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingSetupComponent } from './billing-setup.component';

describe('BillingSetupComponent', () => {
  let component: BillingSetupComponent;
  let fixture: ComponentFixture<BillingSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
