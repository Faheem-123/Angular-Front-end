import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingProviderSetupComponent } from './billing-provider-setup.component';

describe('BillingProviderSetupComponent', () => {
  let component: BillingProviderSetupComponent;
  let fixture: ComponentFixture<BillingProviderSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingProviderSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingProviderSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
