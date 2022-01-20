import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentRulesComponent } from './appointment-rules.component';

describe('AppointmentRulesComponent', () => {
  let component: AppointmentRulesComponent;
  let fixture: ComponentFixture<AppointmentRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
