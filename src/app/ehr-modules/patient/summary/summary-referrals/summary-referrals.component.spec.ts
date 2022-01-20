import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryReferralsComponent } from './summary-referrals.component';

describe('SummaryReferralsComponent', () => {
  let component: SummaryReferralsComponent;
  let fixture: ComponentFixture<SummaryReferralsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryReferralsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
