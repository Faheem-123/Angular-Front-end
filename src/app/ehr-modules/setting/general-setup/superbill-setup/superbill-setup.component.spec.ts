import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperbillSetupComponent } from './superbill-setup.component';

describe('SuperbillSetupComponent', () => {
  let component: SuperbillSetupComponent;
  let fixture: ComponentFixture<SuperbillSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperbillSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperbillSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
