import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptEligibilityVerificationComponent } from './rpt-eligibility-verification.component';

describe('RptEligibilityVerificationComponent', () => {
  let component: RptEligibilityVerificationComponent;
  let fixture: ComponentFixture<RptEligibilityVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptEligibilityVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptEligibilityVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
