import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCashregisterComponent } from './dashboard-cashregister.component';

describe('DashboardCashregisterComponent', () => {
  let component: DashboardCashregisterComponent;
  let fixture: ComponentFixture<DashboardCashregisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardCashregisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCashregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
