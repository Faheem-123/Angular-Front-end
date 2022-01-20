import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartClosingSummaryComponent } from './chart-closing-summary.component';

describe('ChartClosingSummaryComponent', () => {
  let component: ChartClosingSummaryComponent;
  let fixture: ComponentFixture<ChartClosingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartClosingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartClosingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
