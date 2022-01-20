import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptAgingTabComponent } from './rpt-aging-tab.component';

describe('RptAgingTabComponent', () => {
  let component: RptAgingTabComponent;
  let fixture: ComponentFixture<RptAgingTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptAgingTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptAgingTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
