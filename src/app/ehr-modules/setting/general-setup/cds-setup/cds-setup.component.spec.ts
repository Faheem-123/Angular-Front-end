import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdsSetupComponent } from './cds-setup.component';

describe('CdsSetupComponent', () => {
  let component: CdsSetupComponent;
  let fixture: ComponentFixture<CdsSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdsSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
