import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMaintCustomtestComponent } from './health-maint-customtest.component';

describe('HealthMaintCustomtestComponent', () => {
  let component: HealthMaintCustomtestComponent;
  let fixture: ComponentFixture<HealthMaintCustomtestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthMaintCustomtestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMaintCustomtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
