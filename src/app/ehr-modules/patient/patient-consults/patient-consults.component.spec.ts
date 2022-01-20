import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConsultsComponent } from './patient-consults.component';

describe('PatientConsultsComponent', () => {
  let component: PatientConsultsComponent;
  let fixture: ComponentFixture<PatientConsultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientConsultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientConsultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
