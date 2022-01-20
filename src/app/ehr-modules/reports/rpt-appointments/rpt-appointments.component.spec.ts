import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptAppointmentsComponent } from './rpt-appointments.component';

describe('RptAppointmentsComponent', () => {
  let component: RptAppointmentsComponent;
  let fixture: ComponentFixture<RptAppointmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptAppointmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
