import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineFirmSearchComponent } from './inline-firm-search.component';

describe('InlineFirmSearchComponent', () => {
  let component: InlineFirmSearchComponent;
  let fixture: ComponentFixture<InlineFirmSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineFirmSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineFirmSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
