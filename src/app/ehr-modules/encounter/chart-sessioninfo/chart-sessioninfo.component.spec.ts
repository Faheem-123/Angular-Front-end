import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSessioninfoComponent } from './chart-sessioninfo.component';

describe('ChartSessioninfoComponent', () => {
  let component: ChartSessioninfoComponent;
  let fixture: ComponentFixture<ChartSessioninfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSessioninfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSessioninfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
