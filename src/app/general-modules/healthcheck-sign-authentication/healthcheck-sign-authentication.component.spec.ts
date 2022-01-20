import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthcheckSignAuthenticationComponent } from './healthcheck-sign-authentication.component';

describe('HealthcheckSignAuthenticationComponent', () => {
  let component: HealthcheckSignAuthenticationComponent;
  let fixture: ComponentFixture<HealthcheckSignAuthenticationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthcheckSignAuthenticationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthcheckSignAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
