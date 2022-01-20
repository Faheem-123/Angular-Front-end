import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraCapturePopupComponent } from './camera-capture-popup.component';

describe('CameraCapturePopupComponent', () => {
  let component: CameraCapturePopupComponent;
  let fixture: ComponentFixture<CameraCapturePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraCapturePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraCapturePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
