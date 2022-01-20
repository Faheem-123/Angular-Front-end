import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegisterModificationNotesComponent } from './cash-register-modification-notes.component';

describe('CashRegisterModificationNotesComponent', () => {
  let component: CashRegisterModificationNotesComponent;
  let fixture: ComponentFixture<CashRegisterModificationNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashRegisterModificationNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashRegisterModificationNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
