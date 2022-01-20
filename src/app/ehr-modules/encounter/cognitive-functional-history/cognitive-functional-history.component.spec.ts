import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CognitiveFunctionalHistoryComponent } from './cognitive-functional-history.component';

describe('CognitiveFunctionalHistoryComponent', () => {
  let component: CognitiveFunctionalHistoryComponent;
  let fixture: ComponentFixture<CognitiveFunctionalHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CognitiveFunctionalHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CognitiveFunctionalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
