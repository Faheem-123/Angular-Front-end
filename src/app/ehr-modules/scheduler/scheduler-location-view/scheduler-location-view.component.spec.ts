import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerLocationViewComponent } from './scheduler-location-view.component';

describe('SchedulerLocationViewComponent', () => {
  let component: SchedulerLocationViewComponent;
  let fixture: ComponentFixture<SchedulerLocationViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerLocationViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerLocationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
