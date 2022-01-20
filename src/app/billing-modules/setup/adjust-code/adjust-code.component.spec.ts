import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustCodeComponent } from './adjust-code.component';

describe('AdjustCodeComponent', () => {
  let component: AdjustCodeComponent;
  let fixture: ComponentFixture<AdjustCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
