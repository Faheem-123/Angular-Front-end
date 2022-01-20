import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttorneySetupComponent } from './attorney-setup.component';

describe('AttorneySetupComponent', () => {
  let component: AttorneySetupComponent;
  let fixture: ComponentFixture<AttorneySetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttorneySetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttorneySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
