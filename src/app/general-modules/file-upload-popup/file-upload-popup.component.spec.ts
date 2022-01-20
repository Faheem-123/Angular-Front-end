import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadPopupComponent } from './file-upload-popup.component';

describe('FileUploadPopupComponent', () => {
  let component: FileUploadPopupComponent;
  let fixture: ComponentFixture<FileUploadPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
