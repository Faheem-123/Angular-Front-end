import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPendingencouonterComponent } from './dashboard-pendingencouonter.component';

describe('DashboardPendingencouonterComponent', () => {
  let component: DashboardPendingencouonterComponent;
  let fixture: ComponentFixture<DashboardPendingencouonterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPendingencouonterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPendingencouonterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
