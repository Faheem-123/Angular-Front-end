import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartModuleTabsComponent } from './chart-module-tabs.component';

describe('ChartModuleTabsComponent', () => {
  let component: ChartModuleTabsComponent;
  let fixture: ComponentFixture<ChartModuleTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartModuleTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartModuleTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
