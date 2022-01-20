import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterTemplateSetupComponent } from './encounter-template-setup.component';

describe('EncounterTemplateSetupComponent', () => {
  let component: EncounterTemplateSetupComponent;
  let fixture: ComponentFixture<EncounterTemplateSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterTemplateSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterTemplateSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
