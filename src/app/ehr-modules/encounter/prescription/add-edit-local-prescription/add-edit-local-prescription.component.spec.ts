import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLocalPrescriptionComponent } from './add-edit-local-prescription.component';

describe('AddEditLocalPrescriptionComponent', () => {
  let component: AddEditLocalPrescriptionComponent;
  let fixture: ComponentFixture<AddEditLocalPrescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditLocalPrescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditLocalPrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
