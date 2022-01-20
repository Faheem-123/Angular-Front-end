import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPendingclaimsComponent } from './dashboard-pendingclaims.component';

describe('DashboardPendingclaimsComponent', () => {
  let component: DashboardPendingclaimsComponent;
  let fixture: ComponentFixture<DashboardPendingclaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPendingclaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPendingclaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
