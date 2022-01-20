import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsSettingComponent } from './rooms-setting.component';

describe('RoomsSettingComponent', () => {
  let component: RoomsSettingComponent;
  let fixture: ComponentFixture<RoomsSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomsSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomsSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
