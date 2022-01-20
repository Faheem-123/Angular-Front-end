import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptClaimDetailComponent } from './rpt-claim-detail.component';

describe('RptClaimDetailComponent', () => {
  let component: RptClaimDetailComponent;
  let fixture: ComponentFixture<RptClaimDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptClaimDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptClaimDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
