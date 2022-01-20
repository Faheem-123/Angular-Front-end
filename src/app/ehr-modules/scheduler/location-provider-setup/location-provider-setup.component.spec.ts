import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationProviderSetupComponent } from './location-provider-setup.component';

describe('LocationProviderSetupComponent', () => {
  let component: LocationProviderSetupComponent;
  let fixture: ComponentFixture<LocationProviderSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationProviderSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationProviderSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
