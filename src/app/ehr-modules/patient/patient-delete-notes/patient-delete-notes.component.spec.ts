import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDeleteNotesComponent } from './patient-delete-notes.component';

describe('PatientDeleteNotesComponent', () => {
  let component: PatientDeleteNotesComponent;
  let fixture: ComponentFixture<PatientDeleteNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientDeleteNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDeleteNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
