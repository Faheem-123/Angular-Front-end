import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdultBmiComponent } from './adult-bmi.component';

describe('AdultBmiComponent', () => {
  let component: AdultBmiComponent;
  let fixture: ComponentFixture<AdultBmiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdultBmiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdultBmiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
