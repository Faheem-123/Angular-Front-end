import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineImmunizationSearchComponent } from './inline-immunization-search.component';

describe('InlineImmunizationSearchComponent', () => {
  let component: InlineImmunizationSearchComponent;
  let fixture: ComponentFixture<InlineImmunizationSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineImmunizationSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineImmunizationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
