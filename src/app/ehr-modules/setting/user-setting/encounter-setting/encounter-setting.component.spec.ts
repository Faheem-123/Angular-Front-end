import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterSettingComponent } from './encounter-setting.component';

describe('EncounterSettingComponent', () => {
  let component: EncounterSettingComponent;
  let fixture: ComponentFixture<EncounterSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
