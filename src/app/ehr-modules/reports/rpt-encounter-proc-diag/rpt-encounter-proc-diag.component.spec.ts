import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptEncounterProcDiagComponent } from './rpt-encounter-proc-diag.component';

describe('RptEncounterProcDiagComponent', () => {
  let component: RptEncounterProcDiagComponent;
  let fixture: ComponentFixture<RptEncounterProcDiagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptEncounterProcDiagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptEncounterProcDiagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
