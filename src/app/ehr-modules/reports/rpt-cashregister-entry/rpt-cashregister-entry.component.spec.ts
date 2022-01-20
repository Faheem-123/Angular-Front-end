import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptCashregisterEntryComponent } from './rpt-cashregister-entry.component';

describe('RptCashregisterEntryComponent', () => {
  let component: RptCashregisterEntryComponent;
  let fixture: ComponentFixture<RptCashregisterEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptCashregisterEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptCashregisterEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
