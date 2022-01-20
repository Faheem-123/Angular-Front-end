import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptGeneralComponent } from './rpt-general.component';

describe('RptGeneralComponent', () => {
  let component: RptGeneralComponent;
  let fixture: ComponentFixture<RptGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
