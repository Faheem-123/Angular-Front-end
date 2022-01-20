import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabSummaryComponent } from './lab-summary.component';

describe('LabSummaryComponent', () => {
  let component: LabSummaryComponent;
  let fixture: ComponentFixture<LabSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
