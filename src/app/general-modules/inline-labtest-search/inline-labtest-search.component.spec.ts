import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineLabtestSearchComponent } from './inline-labtest-search.component';

describe('InlineLabtestSearchComponent', () => {
  let component: InlineLabtestSearchComponent;
  let fixture: ComponentFixture<InlineLabtestSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineLabtestSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineLabtestSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
