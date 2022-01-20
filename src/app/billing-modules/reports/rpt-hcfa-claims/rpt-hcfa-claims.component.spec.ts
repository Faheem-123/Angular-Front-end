import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptHcfaClaimsComponent } from './rpt-hcfa-claims.component';

describe('RptHcfaClaimsComponent', () => {
  let component: RptHcfaClaimsComponent;
  let fixture: ComponentFixture<RptHcfaClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptHcfaClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptHcfaClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
