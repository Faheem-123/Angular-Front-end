import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentTypesSettingComponent } from './appointment-types-setting.component';

describe('AppointmentTypesSettingComponent', () => {
  let component: AppointmentTypesSettingComponent;
  let fixture: ComponentFixture<AppointmentTypesSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentTypesSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentTypesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
