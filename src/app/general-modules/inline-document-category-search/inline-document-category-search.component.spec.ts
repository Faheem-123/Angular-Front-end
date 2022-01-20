import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDocumentCategorySearchComponent } from './inline-document-category-search.component';

describe('InlineDocumentCategorySearchComponent', () => {
  let component: InlineDocumentCategorySearchComponent;
  let fixture: ComponentFixture<InlineDocumentCategorySearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineDocumentCategorySearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDocumentCategorySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
