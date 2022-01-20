import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerMainComponent } from './scheduler-main.component';

describe('SchedulerMainComponent', () => {
  let component: SchedulerMainComponent;
  let fixture: ComponentFixture<SchedulerMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
