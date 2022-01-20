import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMaintVaccinationComponent } from './health-maint-vaccination.component';

describe('HealthMaintVaccinationComponent', () => {
  let component: HealthMaintVaccinationComponent;
  let fixture: ComponentFixture<HealthMaintVaccinationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthMaintVaccinationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMaintVaccinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
