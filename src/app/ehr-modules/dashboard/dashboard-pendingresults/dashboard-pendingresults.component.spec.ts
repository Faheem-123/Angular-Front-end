import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPendingresultsComponent } from './dashboard-pendingresults.component';

describe('DashboardPendingresultsComponent', () => {
  let component: DashboardPendingresultsComponent;
  let fixture: ComponentFixture<DashboardPendingresultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPendingresultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPendingresultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
