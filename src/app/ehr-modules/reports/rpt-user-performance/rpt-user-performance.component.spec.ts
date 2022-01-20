import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptUserPerformanceComponent } from './rpt-user-performance.component';

describe('RptUserPerformanceComponent', () => {
  let component: RptUserPerformanceComponent;
  let fixture: ComponentFixture<RptUserPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptUserPerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptUserPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
