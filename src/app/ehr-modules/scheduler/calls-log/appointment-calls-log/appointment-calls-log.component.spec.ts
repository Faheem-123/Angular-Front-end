import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentCallsLogComponent } from './appointment-calls-log.component';

describe('AppointmentCallsLogComponent', () => {
  let component: AppointmentCallsLogComponent;
  let fixture: ComponentFixture<AppointmentCallsLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentCallsLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentCallsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
