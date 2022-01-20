import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptClaimSummaryComponent } from './rpt-claim-summary.component';

describe('RptClaimSummaryComponent', () => {
  let component: RptClaimSummaryComponent;
  let fixture: ComponentFixture<RptClaimSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptClaimSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptClaimSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
