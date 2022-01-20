import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientGrowthChartComponent } from './patient-growth-chart.component';

describe('PatientGrowthChartComponent', () => {
  let component: PatientGrowthChartComponent;
  let fixture: ComponentFixture<PatientGrowthChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientGrowthChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientGrowthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
