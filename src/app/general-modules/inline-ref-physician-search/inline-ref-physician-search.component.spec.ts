import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineRefPhysicianSearchComponent } from './inline-ref-physician-search.component';

describe('InlineRefPhysicianSearchComponent', () => {
  let component: InlineRefPhysicianSearchComponent;
  let fixture: ComponentFixture<InlineRefPhysicianSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineRefPhysicianSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineRefPhysicianSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
