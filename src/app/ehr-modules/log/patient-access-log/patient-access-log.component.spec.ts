import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccessLogComponent } from './patient-access-log.component';

describe('PatientAccessLogComponent', () => {
  let component: PatientAccessLogComponent;
  let fixture: ComponentFixture<PatientAccessLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientAccessLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccessLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
