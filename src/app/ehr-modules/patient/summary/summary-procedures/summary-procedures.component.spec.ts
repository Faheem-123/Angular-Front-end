import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryProceduresComponent } from './summary-procedures.component';

describe('SummaryProceduresComponent', () => {
  let component: SummaryProceduresComponent;
  let fixture: ComponentFixture<SummaryProceduresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryProceduresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
