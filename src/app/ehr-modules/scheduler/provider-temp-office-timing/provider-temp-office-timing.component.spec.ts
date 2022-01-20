import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderTempOfficeTimingComponent } from './provider-temp-office-timing.component';

describe('ProviderTempOfficeTimingComponent', () => {
  let component: ProviderTempOfficeTimingComponent;
  let fixture: ComponentFixture<ProviderTempOfficeTimingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderTempOfficeTimingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderTempOfficeTimingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
