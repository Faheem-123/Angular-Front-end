import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralViewersComponent } from './referral-viewers.component';

describe('ReferralViewersComponent', () => {
  let component: ReferralViewersComponent;
  let fixture: ComponentFixture<ReferralViewersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferralViewersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralViewersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
