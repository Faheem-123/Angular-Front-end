import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceSetupSearchComponent } from './insurance-setup-search.component';

describe('InsuranceSetupSearchComponent', () => {
  let component: InsuranceSetupSearchComponent;
  let fixture: ComponentFixture<InsuranceSetupSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceSetupSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceSetupSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
