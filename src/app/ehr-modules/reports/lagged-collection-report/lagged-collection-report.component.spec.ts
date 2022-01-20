import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LaggedCollectionReportComponent } from './lagged-collection-report.component';

describe('LaggedCollectionReportComponent', () => {
  let component: LaggedCollectionReportComponent;
  let fixture: ComponentFixture<LaggedCollectionReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LaggedCollectionReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaggedCollectionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
