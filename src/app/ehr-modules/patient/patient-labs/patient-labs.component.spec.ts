import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLabsComponent } from './patient-labs.component';

describe('PatientLabsComponent', () => {
  let component: PatientLabsComponent;
  let fixture: ComponentFixture<PatientLabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientLabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientLabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
