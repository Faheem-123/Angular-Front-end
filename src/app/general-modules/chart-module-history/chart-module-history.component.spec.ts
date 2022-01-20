import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartModuleHistoryComponent } from './chart-module-history.component';

describe('ChartModuleHistoryComponent', () => {
  let component: ChartModuleHistoryComponent;
  let fixture: ComponentFixture<ChartModuleHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartModuleHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartModuleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
