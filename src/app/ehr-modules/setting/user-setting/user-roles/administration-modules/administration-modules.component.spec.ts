import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationModulesComponent } from './administration-modules.component';

describe('AdministrationModulesComponent', () => {
  let component: AdministrationModulesComponent;
  let fixture: ComponentFixture<AdministrationModulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationModulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
