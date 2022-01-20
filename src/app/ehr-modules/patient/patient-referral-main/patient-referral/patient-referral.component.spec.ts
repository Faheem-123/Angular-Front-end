import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReferralComponent } from './patient-referral.component';

describe('PatientReferralComponent', () => {
  let component: PatientReferralComponent;
  let fixture: ComponentFixture<PatientReferralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientReferralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
