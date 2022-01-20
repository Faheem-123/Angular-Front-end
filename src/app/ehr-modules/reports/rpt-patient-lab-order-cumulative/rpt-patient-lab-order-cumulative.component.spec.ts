import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPatientLabOrderCumulativeComponent } from './rpt-patient-lab-order-cumulative.component';

describe('RptPatientLabOrderCumulativeComponent', () => {
  let component: RptPatientLabOrderCumulativeComponent;
  let fixture: ComponentFixture<RptPatientLabOrderCumulativeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPatientLabOrderCumulativeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPatientLabOrderCumulativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
