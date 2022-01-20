import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationSettingComponent } from './immunization-setting.component';

describe('ImmunizationSettingComponent', () => {
  let component: ImmunizationSettingComponent;
  let fixture: ComponentFixture<ImmunizationSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImmunizationSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImmunizationSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
