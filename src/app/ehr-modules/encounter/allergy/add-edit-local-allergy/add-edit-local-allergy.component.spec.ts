import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLocalAllergyComponent } from './add-edit-local-allergy.component';

describe('AddEditLocalAllergyComponent', () => {
  let component: AddEditLocalAllergyComponent;
  let fixture: ComponentFixture<AddEditLocalAllergyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditLocalAllergyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditLocalAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
