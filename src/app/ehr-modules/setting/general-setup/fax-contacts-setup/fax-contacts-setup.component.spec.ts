import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaxContactsSetupComponent } from './fax-contacts-setup.component';

describe('FaxContactsSetupComponent', () => {
  let component: FaxContactsSetupComponent;
  let fixture: ComponentFixture<FaxContactsSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaxContactsSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaxContactsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
