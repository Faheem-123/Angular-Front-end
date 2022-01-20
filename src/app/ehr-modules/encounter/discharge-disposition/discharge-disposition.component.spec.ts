import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeDispositionComponent } from './discharge-disposition.component';

describe('DischargeDispositionComponent', () => {
  let component: DischargeDispositionComponent;
  let fixture: ComponentFixture<DischargeDispositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DischargeDispositionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeDispositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
