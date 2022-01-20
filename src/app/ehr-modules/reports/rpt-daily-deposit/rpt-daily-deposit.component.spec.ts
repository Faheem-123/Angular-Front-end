import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptDailyDepositComponent } from './rpt-daily-deposit.component';

describe('RptDailyDepositComponent', () => {
  let component: RptDailyDepositComponent;
  let fixture: ComponentFixture<RptDailyDepositComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptDailyDepositComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptDailyDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
