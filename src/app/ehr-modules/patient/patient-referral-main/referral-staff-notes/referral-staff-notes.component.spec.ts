import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralStaffNotesComponent } from './referral-staff-notes.component';

describe('ReferralStaffNotesComponent', () => {
  let component: ReferralStaffNotesComponent;
  let fixture: ComponentFixture<ReferralStaffNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferralStaffNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralStaffNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
