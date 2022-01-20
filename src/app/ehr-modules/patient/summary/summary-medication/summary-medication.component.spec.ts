import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryMedicationComponent } from './summary-medication.component';

describe('SummaryMedicationComponent', () => {
  let component: SummaryMedicationComponent;
  let fixture: ComponentFixture<SummaryMedicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryMedicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
