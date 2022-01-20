import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreNatalComponent } from './pre-natal.component';

describe('PreNatalComponent', () => {
  let component: PreNatalComponent;
  let fixture: ComponentFixture<PreNatalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreNatalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreNatalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
