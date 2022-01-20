import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuarantorSetupComponent } from './guarantor-setup.component';

describe('GuarantorSetupComponent', () => {
  let component: GuarantorSetupComponent;
  let fixture: ComponentFixture<GuarantorSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuarantorSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuarantorSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
