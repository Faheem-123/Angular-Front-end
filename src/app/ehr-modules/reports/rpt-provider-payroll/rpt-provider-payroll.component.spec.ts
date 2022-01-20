import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptProviderPayrollComponent } from './rpt-provider-payroll.component';

describe('RptProviderPayrollComponent', () => {
  let component: RptProviderPayrollComponent;
  let fixture: ComponentFixture<RptProviderPayrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptProviderPayrollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptProviderPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
