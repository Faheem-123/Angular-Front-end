import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlinePhrPatientSearchComponent } from './inline-phr-patient-search.component';

describe('InlinePhrPatientSearchComponent', () => {
  let component: InlinePhrPatientSearchComponent;
  let fixture: ComponentFixture<InlinePhrPatientSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlinePhrPatientSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlinePhrPatientSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
