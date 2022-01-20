import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdultStatureForAgeComponent } from './adult-stature-for-age.component';

describe('AdultStatureForAgeComponent', () => {
  let component: AdultStatureForAgeComponent;
  let fixture: ComponentFixture<AdultStatureForAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdultStatureForAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdultStatureForAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
