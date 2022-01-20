import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCorrespondenceComponent } from './add-to-correspondence.component';

describe('AddToCorrespondenceComponent', () => {
  let component: AddToCorrespondenceComponent;
  let fixture: ComponentFixture<AddToCorrespondenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddToCorrespondenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
