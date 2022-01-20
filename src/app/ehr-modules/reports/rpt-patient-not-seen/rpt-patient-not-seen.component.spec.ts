import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPatientNotSeenComponent } from './rpt-patient-not-seen.component';

describe('RptPatientNotSeenComponent', () => {
  let component: RptPatientNotSeenComponent;
  let fixture: ComponentFixture<RptPatientNotSeenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPatientNotSeenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPatientNotSeenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
