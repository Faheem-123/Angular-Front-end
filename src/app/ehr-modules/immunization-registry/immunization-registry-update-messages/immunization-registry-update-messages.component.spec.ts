import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationRegistryUpdateMessagesComponent } from './immunization-registry-update-messages.component';

describe('ImmunizationRegistryUpdateMessagesComponent', () => {
  let component: ImmunizationRegistryUpdateMessagesComponent;
  let fixture: ComponentFixture<ImmunizationRegistryUpdateMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmunizationRegistryUpdateMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunizationRegistryUpdateMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
