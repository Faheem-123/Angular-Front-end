import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHtmlFormsViewerComponent } from './patient-html-forms-viewer.component';

describe('PatientHtmlFormsViewerComponent', () => {
  let component: PatientHtmlFormsViewerComponent;
  let fixture: ComponentFixture<PatientHtmlFormsViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientHtmlFormsViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientHtmlFormsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
