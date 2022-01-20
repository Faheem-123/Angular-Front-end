import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabAttachmentComponent } from './lab-attachment.component';

describe('LabAttachmentComponent', () => {
  let component: LabAttachmentComponent;
  let fixture: ComponentFixture<LabAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
