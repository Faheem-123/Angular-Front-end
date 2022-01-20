import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentTreatmentPlanComponent } from './assessment-treatment-plan.component';

describe('AssessmentTreatmentPlanComponent', () => {
  let component: AssessmentTreatmentPlanComponent;
  let fixture: ComponentFixture<AssessmentTreatmentPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentTreatmentPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentTreatmentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
