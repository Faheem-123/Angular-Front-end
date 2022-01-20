import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSetupComponent } from './application-setup.component';

describe('ApplicationSetupComponent', () => {
  let component: ApplicationSetupComponent;
  let fixture: ComponentFixture<ApplicationSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
