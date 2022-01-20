import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InjuryTreatmentComponent } from './injury-treatment.component';

describe('InjuryTreatmentComponent', () => {
  let component: InjuryTreatmentComponent;
  let fixture: ComponentFixture<InjuryTreatmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InjuryTreatmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InjuryTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
