import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineFaxContactSearchComponent } from './inline-fax-contact-search.component';

describe('InlineFaxContactSearchComponent', () => {
  let component: InlineFaxContactSearchComponent;
  let fixture: ComponentFixture<InlineFaxContactSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineFaxContactSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineFaxContactSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
