import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpTaskComponent } from './follow-up-task.component';

describe('FollowUpTaskComponent', () => {
  let component: FollowUpTaskComponent;
  let fixture: ComponentFixture<FollowUpTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowUpTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowUpTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
