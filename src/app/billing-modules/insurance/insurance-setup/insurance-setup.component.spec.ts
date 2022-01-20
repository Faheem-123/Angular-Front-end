import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceSetupComponent } from './insurance-setup.component';

describe('InsuranceSetupComponent', () => {
  let component: InsuranceSetupComponent;
  let fixture: ComponentFixture<InsuranceSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
