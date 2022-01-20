import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptProcedureAnalysisComponent } from './rpt-procedure-analysis.component';

describe('RptProcedureAnalysisComponent', () => {
  let component: RptProcedureAnalysisComponent;
  let fixture: ComponentFixture<RptProcedureAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptProcedureAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptProcedureAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
