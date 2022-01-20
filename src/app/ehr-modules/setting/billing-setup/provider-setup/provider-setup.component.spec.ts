import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderSetupComponent } from './provider-setup.component';

describe('ProviderSetupComponent', () => {
  let component: ProviderSetupComponent;
  let fixture: ComponentFixture<ProviderSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
