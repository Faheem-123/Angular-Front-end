import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerSettingsMainComponent } from './scheduler-settings-main.component';

describe('SchedulerSettingsMainComponent', () => {
  let component: SchedulerSettingsMainComponent;
  let fixture: ComponentFixture<SchedulerSettingsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerSettingsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerSettingsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
