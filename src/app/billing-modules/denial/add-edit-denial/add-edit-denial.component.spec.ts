import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditDenialComponent } from './add-edit-denial.component';

describe('AddEditDenialComponent', () => {
  let component: AddEditDenialComponent;
  let fixture: ComponentFixture<AddEditDenialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditDenialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditDenialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
