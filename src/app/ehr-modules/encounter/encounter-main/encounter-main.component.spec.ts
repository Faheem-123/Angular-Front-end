import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterMainComponent } from './encounter-main.component';

describe('EncounterMainComponent', () => {
  let component: EncounterMainComponent;
  let fixture: ComponentFixture<EncounterMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
