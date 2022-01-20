import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDenialComponent } from './claim-denial.component';

describe('ClaimDenialComponent', () => {
  let component: ClaimDenialComponent;
  let fixture: ComponentFixture<ClaimDenialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimDenialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDenialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
