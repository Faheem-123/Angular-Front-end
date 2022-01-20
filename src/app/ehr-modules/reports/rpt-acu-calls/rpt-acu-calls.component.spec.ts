import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptAcuCallsComponent } from './rpt-acu-calls.component';

describe('RptAcuCallsComponent', () => {
  let component: RptAcuCallsComponent;
  let fixture: ComponentFixture<RptAcuCallsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptAcuCallsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptAcuCallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
