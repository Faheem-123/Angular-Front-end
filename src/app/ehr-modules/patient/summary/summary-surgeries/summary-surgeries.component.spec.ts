import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarySurgeriesComponent } from './summary-surgeries.component';

describe('SummarySurgeriesComponent', () => {
  let component: SummarySurgeriesComponent;
  let fixture: ComponentFixture<SummarySurgeriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarySurgeriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarySurgeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
