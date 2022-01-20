import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMaintOthertestComponent } from './health-maint-othertest.component';

describe('HealthMaintOthertestComponent', () => {
  let component: HealthMaintOthertestComponent;
  let fixture: ComponentFixture<HealthMaintOthertestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthMaintOthertestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMaintOthertestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
