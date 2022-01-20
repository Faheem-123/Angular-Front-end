import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLabOrderPendingComponent } from './patient-lab-order-pending.component';

describe('PatientLabOrderPendingComponent', () => {
  let component: PatientLabOrderPendingComponent;
  let fixture: ComponentFixture<PatientLabOrderPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientLabOrderPendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientLabOrderPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
