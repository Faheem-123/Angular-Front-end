import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryConceptionOutcomesComponent } from './summary-conception-outcomes.component';

describe('SummaryConceptionOutcomesComponent', () => {
  let component: SummaryConceptionOutcomesComponent;
  let fixture: ComponentFixture<SummaryConceptionOutcomesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryConceptionOutcomesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryConceptionOutcomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
