import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterTemplatesSettingsComponent } from './letter-templates-settings.component';

describe('LetterTemplatesSettingsComponent', () => {
  let component: LetterTemplatesSettingsComponent;
  let fixture: ComponentFixture<LetterTemplatesSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LetterTemplatesSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterTemplatesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
