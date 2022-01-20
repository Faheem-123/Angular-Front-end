import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthConcernAddProblemComponent } from './health-concern-add-problem.component';

describe('HealthConcernAddProblemComponent', () => {
  let component: HealthConcernAddProblemComponent;
  let fixture: ComponentFixture<HealthConcernAddProblemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthConcernAddProblemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthConcernAddProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
