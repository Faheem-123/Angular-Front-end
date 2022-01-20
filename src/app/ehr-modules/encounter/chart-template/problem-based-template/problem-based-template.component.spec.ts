import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemBasedTemplateComponent } from './problem-based-template.component';

describe('ProblemBasedTemplateComponent', () => {
  let component: ProblemBasedTemplateComponent;
  let fixture: ComponentFixture<ProblemBasedTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemBasedTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemBasedTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
