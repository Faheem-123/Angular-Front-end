import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAdminSettingsComponent } from './users-admin-settings.component';

describe('UsersAdminSettingsComponent', () => {
  let component: UsersAdminSettingsComponent;
  let fixture: ComponentFixture<UsersAdminSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersAdminSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersAdminSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
