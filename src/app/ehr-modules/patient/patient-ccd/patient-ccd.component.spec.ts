import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCcdComponent } from './patient-ccd.component';

describe('PatientCcdComponent', () => {
  let component: PatientCcdComponent;
  let fixture: ComponentFixture<PatientCcdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientCcdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCcdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
