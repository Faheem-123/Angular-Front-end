import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterPrintViewerComponent } from './encounter-print-viewer.component';

describe('EncounterPrintViewerComponent', () => {
  let component: EncounterPrintViewerComponent;
  let fixture: ComponentFixture<EncounterPrintViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterPrintViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterPrintViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
