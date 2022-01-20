import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineSpecialitySearchComponent } from './inline-speciality-search.component';

describe('InlineSpecialitySearchComponent', () => {
  let component: InlineSpecialitySearchComponent;
  let fixture: ComponentFixture<InlineSpecialitySearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineSpecialitySearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineSpecialitySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
