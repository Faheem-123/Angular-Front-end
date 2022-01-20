import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryAllergiesComponent } from './summary-allergies.component';

describe('SummaryAllergiesComponent', () => {
  let component: SummaryAllergiesComponent;
  let fixture: ComponentFixture<SummaryAllergiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryAllergiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryAllergiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
