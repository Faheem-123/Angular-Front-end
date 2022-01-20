import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabCategorySetupComponent } from './lab-category-setup.component';

describe('LabCategorySetupComponent', () => {
  let component: LabCategorySetupComponent;
  let fixture: ComponentFixture<LabCategorySetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabCategorySetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabCategorySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
