import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictedCodeComponent } from './restricted-code.component';

describe('RestrictedCodeComponent', () => {
  let component: RestrictedCodeComponent;
  let fixture: ComponentFixture<RestrictedCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictedCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictedCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
