import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelyAccessComponent } from './timely-access.component';

describe('TimelyAccessComponent', () => {
  let component: TimelyAccessComponent;
  let fixture: ComponentFixture<TimelyAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelyAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelyAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
