import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingUsersComponent } from './billing-users.component';

describe('BillingUsersComponent', () => {
  let component: BillingUsersComponent;
  let fixture: ComponentFixture<BillingUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
