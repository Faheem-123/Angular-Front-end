import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLabOrderFollowupComponent } from './patient-lab-order-followup.component';

describe('PatientLabOrderFollowupComponent', () => {
  let component: PatientLabOrderFollowupComponent;
  let fixture: ComponentFixture<PatientLabOrderFollowupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientLabOrderFollowupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientLabOrderFollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
