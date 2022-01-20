import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherSetupComponent } from './other-setup.component';

describe('OtherSetupComponent', () => {
  let component: OtherSetupComponent;
  let fixture: ComponentFixture<OtherSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
