import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineGuarantorSearchComponent } from './inline-guarantor-search.component';

describe('InlineGuarantorSearchComponent', () => {
  let component: InlineGuarantorSearchComponent;
  let fixture: ComponentFixture<InlineGuarantorSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineGuarantorSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineGuarantorSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
