import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthMaintDrugsComponent } from './health-maint-drugs.component';

describe('HealthMaintDrugsComponent', () => {
  let component: HealthMaintDrugsComponent;
  let fixture: ComponentFixture<HealthMaintDrugsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthMaintDrugsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMaintDrugsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
