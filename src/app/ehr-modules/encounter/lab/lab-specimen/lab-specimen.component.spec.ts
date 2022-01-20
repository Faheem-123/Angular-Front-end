import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabSpecimenComponent } from './lab-specimen.component';

describe('LabSpecimenComponent', () => {
  let component: LabSpecimenComponent;
  let fixture: ComponentFixture<LabSpecimenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabSpecimenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSpecimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
