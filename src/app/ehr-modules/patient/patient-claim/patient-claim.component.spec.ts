import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientClaimComponent } from './patient-claim.component';

describe('PatientClaimComponent', () => {
  let component: PatientClaimComponent;
  let fixture: ComponentFixture<PatientClaimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientClaimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
