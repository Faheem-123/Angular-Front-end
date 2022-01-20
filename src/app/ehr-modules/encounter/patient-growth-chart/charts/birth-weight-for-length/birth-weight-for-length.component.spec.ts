import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthWeightForLengthComponent } from './birth-weight-for-length.component';

describe('BirthWeightForLengthComponent', () => {
  let component: BirthWeightForLengthComponent;
  let fixture: ComponentFixture<BirthWeightForLengthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirthWeightForLengthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirthWeightForLengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
