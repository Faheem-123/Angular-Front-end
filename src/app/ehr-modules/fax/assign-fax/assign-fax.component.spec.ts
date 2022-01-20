import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignFaxComponent } from './assign-fax.component';

describe('AssignFaxComponent', () => {
  let component: AssignFaxComponent;
  let fixture: ComponentFixture<AssignFaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignFaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignFaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
