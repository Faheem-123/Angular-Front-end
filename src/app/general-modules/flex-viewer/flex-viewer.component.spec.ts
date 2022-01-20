import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexViewerComponent } from './flex-viewer.component';

describe('FlexViewerComponent', () => {
  let component: FlexViewerComponent;
  let fixture: ComponentFixture<FlexViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlexViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
