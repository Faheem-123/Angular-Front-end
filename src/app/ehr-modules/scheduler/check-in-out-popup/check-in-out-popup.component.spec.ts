import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInOutPopupComponent } from './check-in-out-popup.component';

describe('CheckInOutPopupComponent', () => {
  let component: CheckInOutPopupComponent;
  let fixture: ComponentFixture<CheckInOutPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckInOutPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInOutPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
