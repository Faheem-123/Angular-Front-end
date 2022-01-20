import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PregnancyRegisterComponent } from './pregnancy-register.component';

describe('PregnancyRegisterComponent', () => {
  let component: PregnancyRegisterComponent;
  let fixture: ComponentFixture<PregnancyRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PregnancyRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PregnancyRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
