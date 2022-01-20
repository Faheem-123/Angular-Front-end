import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditInventoryComponent } from './add-edit-inventory.component';

describe('AddEditInventoryComponent', () => {
  let component: AddEditInventoryComponent;
  let fixture: ComponentFixture<AddEditInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
