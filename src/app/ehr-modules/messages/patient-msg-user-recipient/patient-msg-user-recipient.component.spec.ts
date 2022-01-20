import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMsgUserRecipientComponent } from './patient-msg-user-recipient.component';

describe('PatientMsgUserRecipientComponent', () => {
  let component: PatientMsgUserRecipientComponent;
  let fixture: ComponentFixture<PatientMsgUserRecipientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientMsgUserRecipientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientMsgUserRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
