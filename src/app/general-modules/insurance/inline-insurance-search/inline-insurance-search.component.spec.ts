import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineInsuranceSearchComponent } from './inline-insurance-search.component';

describe('InlineInsuranceSearchComponent', () => {
  let component: InlineInsuranceSearchComponent;
  let fixture: ComponentFixture<InlineInsuranceSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineInsuranceSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineInsuranceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
