import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimReminderComponent } from './claim-reminder.component';

describe('ClaimReminderComponent', () => {
  let component: ClaimReminderComponent;
  let fixture: ComponentFixture<ClaimReminderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimReminderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
