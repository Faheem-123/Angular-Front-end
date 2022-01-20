import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMessageInboxComponent } from './patient-message-inbox.component';

describe('PatientMessageInboxComponent', () => {
  let component: PatientMessageInboxComponent;
  let fixture: ComponentFixture<PatientMessageInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientMessageInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientMessageInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
