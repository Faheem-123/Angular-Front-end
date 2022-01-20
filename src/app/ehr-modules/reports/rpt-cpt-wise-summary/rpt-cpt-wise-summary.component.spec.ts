import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptCptWiseSummaryComponent } from './rpt-cpt-wise-summary.component';

describe('RptCptWiseSummaryComponent', () => {
  let component: RptCptWiseSummaryComponent;
  let fixture: ComponentFixture<RptCptWiseSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptCptWiseSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptCptWiseSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
