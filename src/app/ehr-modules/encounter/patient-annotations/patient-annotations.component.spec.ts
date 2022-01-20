import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAnnotationsComponent } from './patient-annotations.component';

describe('PatientAnnotationsComponent', () => {
  let component: PatientAnnotationsComponent;
  let fixture: ComponentFixture<PatientAnnotationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientAnnotationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAnnotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
