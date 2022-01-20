import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderCallComponent } from './reminder-call.component';

describe('ReminderCallComponent', () => {
  let component: ReminderCallComponent;
  let fixture: ComponentFixture<ReminderCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReminderCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
