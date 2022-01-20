import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyDepositMainComponent } from './daily-deposit-main.component';

describe('DailyDepositMainComponent', () => {
  let component: DailyDepositMainComponent;
  let fixture: ComponentFixture<DailyDepositMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyDepositMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyDepositMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
