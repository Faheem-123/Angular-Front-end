import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EncounterUserSettingComponent } from './encounter-user-setting.component';


describe('EncounterSettingSettingsComponent', () => {
  let component: EncounterUserSettingComponent;
  let fixture: ComponentFixture<EncounterUserSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterUserSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterUserSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
