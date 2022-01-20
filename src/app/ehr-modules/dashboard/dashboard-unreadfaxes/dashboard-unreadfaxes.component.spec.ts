import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUnreadfaxesComponent } from './dashboard-unreadfaxes.component';

describe('DashboardUnreadfaxesComponent', () => {
  let component: DashboardUnreadfaxesComponent;
  let fixture: ComponentFixture<DashboardUnreadfaxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardUnreadfaxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardUnreadfaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
