import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMaintCommontestComponent } from './health-maint-commontest.component';

describe('HealthMaintCommontestComponent', () => {
  let component: HealthMaintCommontestComponent;
  let fixture: ComponentFixture<HealthMaintCommontestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthMaintCommontestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMaintCommontestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
