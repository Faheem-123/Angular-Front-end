import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptBankdepositComponent } from './rpt-bankdeposit.component';

describe('RptBankdepositComponent', () => {
  let component: RptBankdepositComponent;
  let fixture: ComponentFixture<RptBankdepositComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptBankdepositComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptBankdepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
