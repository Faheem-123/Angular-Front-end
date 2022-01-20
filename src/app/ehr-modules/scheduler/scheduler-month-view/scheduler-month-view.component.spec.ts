import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerMonthViewComponent } from './scheduler-month-view.component';

describe('SchedulerMonthViewComponent', () => {
  let component: SchedulerMonthViewComponent;
  let fixture: ComponentFixture<SchedulerMonthViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerMonthViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerMonthViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
