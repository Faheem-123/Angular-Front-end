import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCareTeamMemberAddEditPopupComponent } from './patient-care-team-member-add-edit-popup.component';

describe('PatientCareTeamMemberAddEditPopupComponent', () => {
  let component: PatientCareTeamMemberAddEditPopupComponent;
  let fixture: ComponentFixture<PatientCareTeamMemberAddEditPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientCareTeamMemberAddEditPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCareTeamMemberAddEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
