import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthLengthForAgeComponent } from './birth-length-for-age.component';

describe('BirthLengthForAgeComponent', () => {
  let component: BirthLengthForAgeComponent;
  let fixture: ComponentFixture<BirthLengthForAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirthLengthForAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirthLengthForAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
