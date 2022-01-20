import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemBasedTemplateSetupComponent } from './problem-based-template-setup.component';

describe('ProblemBasedTemplateSetupComponent', () => {
  let component: ProblemBasedTemplateSetupComponent;
  let fixture: ComponentFixture<ProblemBasedTemplateSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemBasedTemplateSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemBasedTemplateSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
