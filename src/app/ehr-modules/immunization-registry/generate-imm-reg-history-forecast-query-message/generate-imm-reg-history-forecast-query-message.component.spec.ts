import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateImmRegHistoryForecastQueryMessageComponent } from './generate-imm-reg-history-forecast-query-message.component';

describe('GenerateImmRegHistoryForecastQueryMessageComponent', () => {
  let component: GenerateImmRegHistoryForecastQueryMessageComponent;
  let fixture: ComponentFixture<GenerateImmRegHistoryForecastQueryMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateImmRegHistoryForecastQueryMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateImmRegHistoryForecastQueryMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
