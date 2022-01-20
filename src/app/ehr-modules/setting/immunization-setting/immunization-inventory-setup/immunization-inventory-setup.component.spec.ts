import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationInventorySetupComponent } from './immunization-inventory-setup.component';

describe('ImmunizationInventorySetupComponent', () => {
  let component: ImmunizationInventorySetupComponent;
  let fixture: ComponentFixture<ImmunizationInventorySetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmunizationInventorySetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunizationInventorySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
