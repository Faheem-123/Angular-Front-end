import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationRegistryMessagesMainComponent } from './immunization-registry-messages-main.component';

describe('ImmunizationRegistryMessagesMainComponent', () => {
  let component: ImmunizationRegistryMessagesMainComponent;
  let fixture: ComponentFixture<ImmunizationRegistryMessagesMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmunizationRegistryMessagesMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunizationRegistryMessagesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
