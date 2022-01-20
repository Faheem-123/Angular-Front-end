import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAdminMainComponent } from './user-admin-main.component';

describe('UserAdminMainComponent', () => {
  let component: UserAdminMainComponent;
  let fixture: ComponentFixture<UserAdminMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAdminMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAdminMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
