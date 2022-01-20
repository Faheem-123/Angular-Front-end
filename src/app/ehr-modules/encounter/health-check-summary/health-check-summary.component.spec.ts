import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthCheckSummaryComponent } from './health-check-summary.component';

describe('HealthCheckSummaryComponent', () => {
  let component: HealthCheckSummaryComponent;
  let fixture: ComponentFixture<HealthCheckSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthCheckSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthCheckSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
