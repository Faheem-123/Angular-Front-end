import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderOfficeTimingComponent } from './provider-office-timing.component';

describe('ProviderOfficeTimingComponent', () => {
  let component: ProviderOfficeTimingComponent;
  let fixture: ComponentFixture<ProviderOfficeTimingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderOfficeTimingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderOfficeTimingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
