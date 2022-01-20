import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCheckedinpatientComponent } from './dashboard-checkedinpatient.component';

describe('DashboardCheckedinpatientComponent', () => {
  let component: DashboardCheckedinpatientComponent;
  let fixture: ComponentFixture<DashboardCheckedinpatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardCheckedinpatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCheckedinpatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
