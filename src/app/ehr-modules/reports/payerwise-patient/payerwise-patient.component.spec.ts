import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayerwisePatientComponent } from './payerwise-patient.component';

describe('PayerwisePatientComponent', () => {
  let component: PayerwisePatientComponent;
  let fixture: ComponentFixture<PayerwisePatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayerwisePatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayerwisePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
