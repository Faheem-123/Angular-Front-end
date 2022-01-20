import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptDenialComponent } from './rpt-denial.component';

describe('RptDenialComponent', () => {
  let component: RptDenialComponent;
  let fixture: ComponentFixture<RptDenialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptDenialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptDenialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
