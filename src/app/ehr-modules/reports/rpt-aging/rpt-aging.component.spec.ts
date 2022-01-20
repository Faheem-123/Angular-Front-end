import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptAgingComponent } from './rpt-aging.component';

describe('RptAgingComponent', () => {
  let component: RptAgingComponent;
  let fixture: ComponentFixture<RptAgingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptAgingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
