import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientApiUsersComponent } from './patient-api-users.component';

describe('PatientApiUsersComponent', () => {
  let component: PatientApiUsersComponent;
  let fixture: ComponentFixture<PatientApiUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientApiUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientApiUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
