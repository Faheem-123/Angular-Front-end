import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterReportComponent } from './encounter-report.component';

describe('EncounterReportComponent', () => {
  let component: EncounterReportComponent;
  let fixture: ComponentFixture<EncounterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
