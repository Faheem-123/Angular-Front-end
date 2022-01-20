import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCaptureComponent } from './info-capture.component';

describe('InfoCaptureComponent', () => {
  let component: InfoCaptureComponent;
  let fixture: ComponentFixture<InfoCaptureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoCaptureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
