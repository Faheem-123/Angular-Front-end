import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptAgingPayerWiseComponent } from './rpt-aging-payer-wise.component';

describe('RptAgingPayerWiseComponent', () => {
  let component: RptAgingPayerWiseComponent;
  let fixture: ComponentFixture<RptAgingPayerWiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptAgingPayerWiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptAgingPayerWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
