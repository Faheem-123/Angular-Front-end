import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CqmReportComponent } from './cqm-report.component';

describe('CqmReportComponent', () => {
  let component: CqmReportComponent;
  let fixture: ComponentFixture<CqmReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CqmReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CqmReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
