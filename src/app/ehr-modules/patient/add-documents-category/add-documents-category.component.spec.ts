import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDocumentsCategoryComponent } from './add-documents-category.component';

describe('AddDocumentsCategoryComponent', () => {
  let component: AddDocumentsCategoryComponent;
  let fixture: ComponentFixture<AddDocumentsCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDocumentsCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDocumentsCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
