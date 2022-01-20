import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMaintLipidComponent } from './health-maint-lipid.component';

describe('HealthMaintLipidComponent', () => {
  let component: HealthMaintLipidComponent;
  let fixture: ComponentFixture<HealthMaintLipidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthMaintLipidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMaintLipidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
