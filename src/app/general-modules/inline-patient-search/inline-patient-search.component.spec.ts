import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlinePatientSearchComponent } from './inline-patient-search.component';

describe('InlinePatientSearchComponent', () => {
  let component: InlinePatientSearchComponent;
  let fixture: ComponentFixture<InlinePatientSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlinePatientSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlinePatientSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
