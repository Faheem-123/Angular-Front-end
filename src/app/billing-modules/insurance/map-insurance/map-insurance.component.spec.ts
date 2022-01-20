import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapInsuranceComponent } from './map-insurance.component';

describe('MapInsuranceComponent', () => {
  let component: MapInsuranceComponent;
  let fixture: ComponentFixture<MapInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
