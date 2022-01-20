import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisSetupComponent } from './diagnosis-setup.component';

describe('DiagnosisSetupComponent', () => {
  let component: DiagnosisSetupComponent;
  let fixture: ComponentFixture<DiagnosisSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnosisSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosisSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
