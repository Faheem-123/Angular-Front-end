import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFaxComponent } from './new-fax.component';

describe('NewFaxComponent', () => {
  let component: NewFaxComponent;
  let fixture: ComponentFixture<NewFaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewFaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
