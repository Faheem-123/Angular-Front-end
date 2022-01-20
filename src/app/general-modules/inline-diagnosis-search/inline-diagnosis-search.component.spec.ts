import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDiagnosisSearchComponent } from './inline-diagnosis-search.component';

describe('InlineDiagnosisSearchComponent', () => {
  let component: InlineDiagnosisSearchComponent;
  let fixture: ComponentFixture<InlineDiagnosisSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineDiagnosisSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDiagnosisSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
