import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUnreadmessagesComponent } from './dashboard-unreadmessages.component';

describe('DashboardUnreadmessagesComponent', () => {
  let component: DashboardUnreadmessagesComponent;
  let fixture: ComponentFixture<DashboardUnreadmessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardUnreadmessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardUnreadmessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
