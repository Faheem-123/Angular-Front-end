import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTaskDataComponent } from './patient-task-data.component';

describe('PatientTaskDataComponent', () => {
  let component: PatientTaskDataComponent;
  let fixture: ComponentFixture<PatientTaskDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientTaskDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientTaskDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
