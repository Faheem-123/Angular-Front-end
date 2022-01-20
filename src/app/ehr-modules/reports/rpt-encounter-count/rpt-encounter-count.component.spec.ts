import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptEncounterCountComponent } from './rpt-encounter-count.component';

describe('RptEncounterCountComponent', () => {
  let component: RptEncounterCountComponent;
  let fixture: ComponentFixture<RptEncounterCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptEncounterCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptEncounterCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
