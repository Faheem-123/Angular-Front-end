import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HcfaViewerComponent } from './hcfa-viewer.component';

describe('HcfaViewerComponent', () => {
  let component: HcfaViewerComponent;
  let fixture: ComponentFixture<HcfaViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HcfaViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HcfaViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
