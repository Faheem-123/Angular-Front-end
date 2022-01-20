import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCorrespondenceComponent } from './patient-correspondence.component';

describe('PatientCorrespondenceComponent', () => {
  let component: PatientCorrespondenceComponent;
  let fixture: ComponentFixture<PatientCorrespondenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientCorrespondenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
