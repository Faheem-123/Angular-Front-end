import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReferralMainComponent } from './patient-referral-main.component';

describe('PatientReferralMainComponent', () => {
  let component: PatientReferralMainComponent;
  let fixture: ComponentFixture<PatientReferralMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientReferralMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientReferralMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
