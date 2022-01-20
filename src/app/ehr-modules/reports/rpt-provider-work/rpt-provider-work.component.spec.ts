import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptProviderWorkComponent } from './rpt-provider-work.component';

describe('RptProviderWorkComponent', () => {
  let component: RptProviderWorkComponent;
  let fixture: ComponentFixture<RptProviderWorkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptProviderWorkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptProviderWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
