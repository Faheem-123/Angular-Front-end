import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewInsuranceComponent } from './add-new-insurance.component';

describe('AddNewInsuranceComponent', () => {
  let component: AddNewInsuranceComponent;
  let fixture: ComponentFixture<AddNewInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
