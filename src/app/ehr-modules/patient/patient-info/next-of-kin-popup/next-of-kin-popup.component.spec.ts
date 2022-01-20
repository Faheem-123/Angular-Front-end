import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NextOfKinPopupComponent } from './next-of-kin-popup.component';

describe('NextOfKinPopupComponent', () => {
  let component: NextOfKinPopupComponent;
  let fixture: ComponentFixture<NextOfKinPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NextOfKinPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NextOfKinPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
