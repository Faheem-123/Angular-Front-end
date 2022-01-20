import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentSourceSettingComponent } from './appointment-source-setting.component';

describe('AppointmentSourceSettingComponent', () => {
  let component: AppointmentSourceSettingComponent;
  let fixture: ComponentFixture<AppointmentSourceSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentSourceSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentSourceSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
