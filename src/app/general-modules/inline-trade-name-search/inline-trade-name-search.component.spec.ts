import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineTradeNameSearchComponent } from './inline-trade-name-search.component';

describe('InlineTradeNameSearchComponent', () => {
  let component: InlineTradeNameSearchComponent;
  let fixture: ComponentFixture<InlineTradeNameSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineTradeNameSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineTradeNameSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
