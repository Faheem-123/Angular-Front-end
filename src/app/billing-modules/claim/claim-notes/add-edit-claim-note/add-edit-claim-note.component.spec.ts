import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditClaimNoteComponent } from './add-edit-claim-note.component';

describe('AddEditClaimNoteComponent', () => {
  let component: AddEditClaimNoteComponent;
  let fixture: ComponentFixture<AddEditClaimNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditClaimNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditClaimNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
