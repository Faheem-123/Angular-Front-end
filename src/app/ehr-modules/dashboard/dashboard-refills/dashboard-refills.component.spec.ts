import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRefillsComponent } from './dashboard-refills.component';

describe('DashboardRefillsComponent', () => {
  let component: DashboardRefillsComponent;
  let fixture: ComponentFixture<DashboardRefillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardRefillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardRefillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
