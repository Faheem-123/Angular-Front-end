import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterSnapshotComponent } from './encounter-snapshot.component';

describe('EncounterSnapshotComponent', () => {
  let component: EncounterSnapshotComponent;
  let fixture: ComponentFixture<EncounterSnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncounterSnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
