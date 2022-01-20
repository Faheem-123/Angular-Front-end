import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMaintenanceComponent } from './health-maintenance.component';

describe('HealthMaintenanceComponent', () => {
  let component: HealthMaintenanceComponent;
  let fixture: ComponentFixture<HealthMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
