import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollCategorySetupComponent } from './payroll-category-setup.component';

describe('PayrollCategorySetupComponent', () => {
  let component: PayrollCategorySetupComponent;
  let fixture: ComponentFixture<PayrollCategorySetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollCategorySetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollCategorySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
