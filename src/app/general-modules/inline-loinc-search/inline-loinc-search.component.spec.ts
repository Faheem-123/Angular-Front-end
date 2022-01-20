import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineLoincSearchComponent } from './inline-loinc-search.component';

describe('InlineLoincSearchComponent', () => {
  let component: InlineLoincSearchComponent;
  let fixture: ComponentFixture<InlineLoincSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineLoincSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineLoincSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
