import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLabOrderSearchComponent } from './patient-lab-order-search.component';

describe('PatientLabOrderSearchComponent', () => {
  let component: PatientLabOrderSearchComponent;
  let fixture: ComponentFixture<PatientLabOrderSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientLabOrderSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientLabOrderSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
