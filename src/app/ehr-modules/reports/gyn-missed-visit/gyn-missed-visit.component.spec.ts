import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GynMissedVisitComponent } from './gyn-missed-visit.component';

describe('GynMissedVisitComponent', () => {
  let component: GynMissedVisitComponent;
  let fixture: ComponentFixture<GynMissedVisitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GynMissedVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GynMissedVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
