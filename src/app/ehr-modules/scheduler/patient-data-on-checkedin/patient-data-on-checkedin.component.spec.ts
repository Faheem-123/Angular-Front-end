import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataOnCheckedinComponent } from './patient-data-on-checkedin.component';

describe('PatientDataOnCheckedinComponent', () => {
  let component: PatientDataOnCheckedinComponent;
  let fixture: ComponentFixture<PatientDataOnCheckedinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientDataOnCheckedinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDataOnCheckedinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
