import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGyneddComponent } from './dashboard-gynedd.component';

describe('DashboardGyneddComponent', () => {
  let component: DashboardGyneddComponent;
  let fixture: ComponentFixture<DashboardGyneddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardGyneddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardGyneddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
