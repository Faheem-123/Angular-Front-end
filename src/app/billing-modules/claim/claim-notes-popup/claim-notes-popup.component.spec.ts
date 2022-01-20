import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimNotesPopupComponent } from './claim-notes-popup.component';

describe('ClaimNotesPopupComponent', () => {
  let component: ClaimNotesPopupComponent;
  let fixture: ComponentFixture<ClaimNotesPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimNotesPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimNotesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
