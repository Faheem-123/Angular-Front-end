import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthWeightForAgeComponent } from './birth-weight-for-age.component';

describe('BirthWeightForAgeComponent', () => {
  let component: BirthWeightForAgeComponent;
  let fixture: ComponentFixture<BirthWeightForAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirthWeightForAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirthWeightForAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
