import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptDailyMtdFinancialComponent } from './rpt-daily-mtd-financial.component';

describe('RptDailyMtdFinancialComponent', () => {
  let component: RptDailyMtdFinancialComponent;
  let fixture: ComponentFixture<RptDailyMtdFinancialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptDailyMtdFinancialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptDailyMtdFinancialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
