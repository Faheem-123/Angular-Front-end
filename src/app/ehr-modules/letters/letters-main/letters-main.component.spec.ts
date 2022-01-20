import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersMainComponent } from './letters-main.component';

describe('LettersMainComponent', () => {
  let component: LettersMainComponent;
  let fixture: ComponentFixture<LettersMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LettersMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LettersMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
