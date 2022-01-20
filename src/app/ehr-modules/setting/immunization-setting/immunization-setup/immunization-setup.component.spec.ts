import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationSetupComponent } from './immunization-setup.component';

describe('ImmunizationSetupComponent', () => {
  let component: ImmunizationSetupComponent;
  let fixture: ComponentFixture<ImmunizationSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmunizationSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunizationSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
