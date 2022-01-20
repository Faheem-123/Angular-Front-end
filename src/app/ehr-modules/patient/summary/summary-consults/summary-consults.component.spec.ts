import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryConsultsComponent } from './summary-consults.component';

describe('SummaryConsultsComponent', () => {
  let component: SummaryConsultsComponent;
  let fixture: ComponentFixture<SummaryConsultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryConsultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryConsultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
