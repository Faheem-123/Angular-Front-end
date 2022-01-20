import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterAccessLogComponent } from './encounter-access-log.component';

describe('EncounterAccessLogComponent', () => {
  let component: EncounterAccessLogComponent;
  let fixture: ComponentFixture<EncounterAccessLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterAccessLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterAccessLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
