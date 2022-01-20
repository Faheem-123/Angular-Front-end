import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerCardCompactComponent } from './scheduler-card-compact.component';

describe('SchedulerCardCompactComponent', () => {
  let component: SchedulerCardCompactComponent;
  let fixture: ComponentFixture<SchedulerCardCompactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerCardCompactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerCardCompactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
