import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryAssessmentsComponent } from './summary-assessments.component';

describe('SummaryAssessmentsComponent', () => {
  let component: SummaryAssessmentsComponent;
  let fixture: ComponentFixture<SummaryAssessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryAssessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryAssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
