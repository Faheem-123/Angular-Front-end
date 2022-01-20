import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcuCallsLogComponent } from './acu-calls-log.component';

describe('AcuCallsLogComponent', () => {
  let component: AcuCallsLogComponent;
  let fixture: ComponentFixture<AcuCallsLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcuCallsLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcuCallsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
