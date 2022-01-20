import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtenderTemplateComponent } from './extender-template.component';

describe('ExtenderTemplateComponent', () => {
  let component: ExtenderTemplateComponent;
  let fixture: ComponentFixture<ExtenderTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtenderTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtenderTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
