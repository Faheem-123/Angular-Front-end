import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPatientStatementComponent } from './rpt-patient-statement.component';

describe('RptPatientStatementComponent', () => {
  let component: RptPatientStatementComponent;
  let fixture: ComponentFixture<RptPatientStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPatientStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPatientStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
