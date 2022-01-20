import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerProviderViewComponent } from './scheduler-provider-view.component';

describe('SchedulerProviderViewComponent', () => {
  let component: SchedulerProviderViewComponent;
  let fixture: ComponentFixture<SchedulerProviderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerProviderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerProviderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
