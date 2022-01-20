import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptInvoiceComponent } from './rpt-invoice.component';

describe('RptInvoiceComponent', () => {
  let component: RptInvoiceComponent;
  let fixture: ComponentFixture<RptInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
