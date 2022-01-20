import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeInsuranceComponent } from './practice-insurance.component';

describe('PracticeInsuranceComponent', () => {
  let component: PracticeInsuranceComponent;
  let fixture: ComponentFixture<PracticeInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
