import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderAuthenticationPopupComponent } from './provider-authentication-popup.component';

describe('ProviderAuthenticationPopupComponent', () => {
  let component: ProviderAuthenticationPopupComponent;
  let fixture: ComponentFixture<ProviderAuthenticationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderAuthenticationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderAuthenticationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
