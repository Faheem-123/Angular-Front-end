import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDrugAbuseComponent } from './chart-drug-abuse.component';

describe('ChartDrugAbuseComponent', () => {
  let component: ChartDrugAbuseComponent;
  let fixture: ComponentFixture<ChartDrugAbuseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDrugAbuseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDrugAbuseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
