import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlinePayerSearchComponent } from './inline-payer-search.component';

describe('InlinePayerSearchComponent', () => {
  let component: InlinePayerSearchComponent;
  let fixture: ComponentFixture<InlinePayerSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlinePayerSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlinePayerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
