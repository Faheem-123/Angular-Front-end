import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMessagesComposeComponent } from './patient-messages-compose.component';

describe('PatientMessagesComposeComponent', () => {
  let component: PatientMessagesComposeComponent;
  let fixture: ComponentFixture<PatientMessagesComposeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientMessagesComposeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientMessagesComposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
