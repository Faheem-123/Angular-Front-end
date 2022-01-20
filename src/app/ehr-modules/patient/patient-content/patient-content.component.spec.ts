import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientContentComponent } from './patient-content.component';

describe('PatientContentComponent', () => {
  let component: PatientContentComponent;
  let fixture: ComponentFixture<PatientContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
