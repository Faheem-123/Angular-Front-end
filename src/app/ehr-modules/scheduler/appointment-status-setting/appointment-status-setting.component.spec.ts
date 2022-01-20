import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentStatusSettingComponent } from './appointment-status-setting.component';

describe('AppointmentStatusSettingComponent', () => {
  let component: AppointmentStatusSettingComponent;
  let fixture: ComponentFixture<AppointmentStatusSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentStatusSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentStatusSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
