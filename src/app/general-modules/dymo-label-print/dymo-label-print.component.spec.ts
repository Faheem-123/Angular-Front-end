import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DymoLabelPrintComponent } from './dymo-label-print.component';

describe('DymoLabelPrintComponent', () => {
  let component: DymoLabelPrintComponent;
  let fixture: ComponentFixture<DymoLabelPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DymoLabelPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DymoLabelPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
