import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryVaccinationComponent } from './summary-vaccination.component';

describe('SummaryVaccinationComponent', () => {
  let component: SummaryVaccinationComponent;
  let fixture: ComponentFixture<SummaryVaccinationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryVaccinationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryVaccinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
