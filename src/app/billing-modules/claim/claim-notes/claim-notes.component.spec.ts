import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimNotesComponent } from './claim-notes.component';

describe('ClaimNotesComponent', () => {
  let component: ClaimNotesComponent;
  let fixture: ComponentFixture<ClaimNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
