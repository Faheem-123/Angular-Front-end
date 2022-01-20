import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPersonalInjuryComponent } from './patient-personal-injury.component';

describe('PatientPersonalInjuryComponent', () => {
  let component: PatientPersonalInjuryComponent;
  let fixture: ComponentFixture<PatientPersonalInjuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientPersonalInjuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPersonalInjuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
