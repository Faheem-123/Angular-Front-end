import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCareTeamAddEditPopupComponent } from './patient-care-team-add-edit-popup.component';

describe('PatientCareTeamAddEditPopupComponent', () => {
  let component: PatientCareTeamAddEditPopupComponent;
  let fixture: ComponentFixture<PatientCareTeamAddEditPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientCareTeamAddEditPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCareTeamAddEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
