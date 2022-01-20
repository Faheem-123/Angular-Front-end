import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptClaimBatchDetailComponent } from './rpt-claim-batch-detail.component';

describe('RptClaimBatchDetailComponent', () => {
  let component: RptClaimBatchDetailComponent;
  let fixture: ComponentFixture<RptClaimBatchDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptClaimBatchDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptClaimBatchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
