import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptMchcComponent } from './rpt-mchc.component';

describe('RptMchcComponent', () => {
  let component: RptMchcComponent;
  let fixture: ComponentFixture<RptMchcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptMchcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptMchcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
