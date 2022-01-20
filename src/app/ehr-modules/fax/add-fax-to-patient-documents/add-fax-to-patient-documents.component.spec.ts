import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFaxToPatientDocumentsComponent } from './add-fax-to-patient-documents.component';

describe('AddFaxToPatientDocumentsComponent', () => {
  let component: AddFaxToPatientDocumentsComponent;
  let fixture: ComponentFixture<AddFaxToPatientDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFaxToPatientDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFaxToPatientDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
