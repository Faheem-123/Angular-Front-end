import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthHeadCircumferenceComponent } from './birth-head-circumference.component';

describe('BirthHeadCircumferenceComponent', () => {
  let component: BirthHeadCircumferenceComponent;
  let fixture: ComponentFixture<BirthHeadCircumferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirthHeadCircumferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirthHeadCircumferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
