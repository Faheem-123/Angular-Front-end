import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryHealthMaintenanceComponent } from './summary-health-maintenance.component';

describe('SummaryHealthMaintenanceComponent', () => {
  let component: SummaryHealthMaintenanceComponent;
  let fixture: ComponentFixture<SummaryHealthMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryHealthMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryHealthMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
