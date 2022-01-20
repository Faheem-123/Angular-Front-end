import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EobComponent } from './eob.component';

describe('EobComponent', () => {
  let component: EobComponent;
  let fixture: ComponentFixture<EobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
