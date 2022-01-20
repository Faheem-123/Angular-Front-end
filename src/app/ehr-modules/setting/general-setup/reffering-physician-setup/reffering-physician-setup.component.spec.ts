import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefferingPhysicianSetupComponent } from './reffering-physician-setup.component';

describe('RefferingPhysicianSetupComponent', () => {
  let component: RefferingPhysicianSetupComponent;
  let fixture: ComponentFixture<RefferingPhysicianSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefferingPhysicianSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefferingPhysicianSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
