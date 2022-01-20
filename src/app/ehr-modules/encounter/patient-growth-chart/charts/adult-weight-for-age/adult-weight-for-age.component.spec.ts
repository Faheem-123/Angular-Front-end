import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdultWeightForAgeComponent } from './adult-weight-for-age.component';

describe('AdultWeightForAgeComponent', () => {
  let component: AdultWeightForAgeComponent;
  let fixture: ComponentFixture<AdultWeightForAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdultWeightForAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdultWeightForAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
