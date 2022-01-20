import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDocCategorySearchComponent } from './inline-doc-category-search.component';

describe('InlineDocCategorySearchComponent', () => {
  let component: InlineDocCategorySearchComponent;
  let fixture: ComponentFixture<InlineDocCategorySearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineDocCategorySearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDocCategorySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
