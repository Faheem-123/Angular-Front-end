import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineProcedureSearchComponent } from './inline-procedure-search.component';

describe('InlineProcedureSearchComponent', () => {
  let component: InlineProcedureSearchComponent;
  let fixture: ComponentFixture<InlineProcedureSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineProcedureSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineProcedureSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
