import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipcitystateSettingsComponent } from './zipcitystate-settings.component';

describe('ZipcitystateSettingsComponent', () => {
  let component: ZipcitystateSettingsComponent;
  let fixture: ComponentFixture<ZipcitystateSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZipcitystateSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZipcitystateSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
