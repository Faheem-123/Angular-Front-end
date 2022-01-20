import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVisComponent } from './add-vis.component';

describe('AddVisComponent', () => {
  let component: AddVisComponent;
  let fixture: ComponentFixture<AddVisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
