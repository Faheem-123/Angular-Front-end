import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptCashRegYearlyCollectionComponent } from './rpt-cash-reg-yearly-collection.component';

describe('RptCashRegYearlyCollectionComponent', () => {
  let component: RptCashRegYearlyCollectionComponent;
  let fixture: ComponentFixture<RptCashRegYearlyCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptCashRegYearlyCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptCashRegYearlyCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
