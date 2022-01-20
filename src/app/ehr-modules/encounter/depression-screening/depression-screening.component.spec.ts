import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepressionScreeningComponent } from './depression-screening.component';

describe('DepressionScreeningComponent', () => {
  let component: DepressionScreeningComponent;
  let fixture: ComponentFixture<DepressionScreeningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepressionScreeningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepressionScreeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
