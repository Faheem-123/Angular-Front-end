import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterTemplateMainComponent } from './encounter-template-main.component';

describe('EncounterTemplateMainComponent', () => {
  let component: EncounterTemplateMainComponent;
  let fixture: ComponentFixture<EncounterTemplateMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterTemplateMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterTemplateMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
