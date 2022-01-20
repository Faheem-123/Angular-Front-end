import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceMainComponent } from './insurance-main.component';

describe('InsuranceMainComponent', () => {
  let component: InsuranceMainComponent;
  let fixture: ComponentFixture<InsuranceMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsuranceMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
