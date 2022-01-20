import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryProblemsComponent } from './summary-problems.component';

describe('SummaryProblemsComponent', () => {
  let component: SummaryProblemsComponent;
  let fixture: ComponentFixture<SummaryProblemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryProblemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryProblemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
