import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptCssCallLogComponent } from './rpt-css-call-log.component';

describe('RptCssCallLogComponent', () => {
  let component: RptCssCallLogComponent;
  let fixture: ComponentFixture<RptCssCallLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptCssCallLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptCssCallLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
