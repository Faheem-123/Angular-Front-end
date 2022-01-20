import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwvScreeningComponent } from './awv-screening.component';

describe('AwvScreeningComponent', () => {
  let component: AwvScreeningComponent;
  let fixture: ComponentFixture<AwvScreeningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwvScreeningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwvScreeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
