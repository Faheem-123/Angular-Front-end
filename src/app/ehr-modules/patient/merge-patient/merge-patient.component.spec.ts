import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergePatientComponent } from './merge-patient.component';

describe('MergePatientComponent', () => {
  let component: MergePatientComponent;
  let fixture: ComponentFixture<MergePatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergePatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
