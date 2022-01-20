import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEobComponent } from './add-edit-eob.component';

describe('AddEditEobComponent', () => {
  let component: AddEditEobComponent;
  let fixture: ComponentFixture<AddEditEobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditEobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditEobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
