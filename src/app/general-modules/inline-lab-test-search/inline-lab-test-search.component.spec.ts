import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineLabTestSearchComponent } from './inline-lab-test-search.component';

describe('InlineLabTestSearchComponent', () => {
  let component: InlineLabTestSearchComponent;
  let fixture: ComponentFixture<InlineLabTestSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineLabTestSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineLabTestSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
