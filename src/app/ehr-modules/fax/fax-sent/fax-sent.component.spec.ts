import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaxSentComponent } from './fax-sent.component';

describe('FaxSentComponent', () => {
  let component: FaxSentComponent;
  let fixture: ComponentFixture<FaxSentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaxSentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaxSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
