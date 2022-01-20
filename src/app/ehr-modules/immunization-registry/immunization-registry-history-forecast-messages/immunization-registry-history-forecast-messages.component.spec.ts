import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationRegistryHistoryForecastMessagesComponent } from './immunization-registry-history-forecast-messages.component';

describe('ImmunizationRegistryHistoryForecastMessagesComponent', () => {
  let component: ImmunizationRegistryHistoryForecastMessagesComponent;
  let fixture: ComponentFixture<ImmunizationRegistryHistoryForecastMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmunizationRegistryHistoryForecastMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunizationRegistryHistoryForecastMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
