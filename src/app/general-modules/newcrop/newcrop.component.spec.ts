import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewcropComponent } from './newcrop.component';

describe('NewcropComponent', () => {
  let component: NewcropComponent;
  let fixture: ComponentFixture<NewcropComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewcropComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewcropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
