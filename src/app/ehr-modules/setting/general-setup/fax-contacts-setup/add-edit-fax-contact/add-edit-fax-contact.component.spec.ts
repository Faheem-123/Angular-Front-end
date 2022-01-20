import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFaxContactComponent } from './add-edit-fax-contact.component';

describe('AddEditFaxContactComponent', () => {
  let component: AddEditFaxContactComponent;
  let fixture: ComponentFixture<AddEditFaxContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditFaxContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditFaxContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
