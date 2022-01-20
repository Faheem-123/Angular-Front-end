import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineRaceEthnicitySearchComponent } from './inline-race-ethnicity-search.component';

describe('InlineRaceEthnicitySearchComponent', () => {
  let component: InlineRaceEthnicitySearchComponent;
  let fixture: ComponentFixture<InlineRaceEthnicitySearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineRaceEthnicitySearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineRaceEthnicitySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
