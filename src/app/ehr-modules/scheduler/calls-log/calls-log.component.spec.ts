import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallsLogComponent } from './calls-log.component';

describe('CallsLogComponent', () => {
  let component: CallsLogComponent;
  let fixture: ComponentFixture<CallsLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallsLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
