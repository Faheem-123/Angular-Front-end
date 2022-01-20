import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLabOrderSignedComponent } from './patient-lab-order-signed.component';

describe('PatientLabOrderSignedComponent', () => {
  let component: PatientLabOrderSignedComponent;
  let fixture: ComponentFixture<PatientLabOrderSignedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientLabOrderSignedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientLabOrderSignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
