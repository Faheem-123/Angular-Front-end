import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSyndromicSurveillanceMessageComponent } from './generate-syndromic-surveillance-message.component';

describe('GenerateSyndromicSurveillanceMessageComponent', () => {
  let component: GenerateSyndromicSurveillanceMessageComponent;
  let fixture: ComponentFixture<GenerateSyndromicSurveillanceMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateSyndromicSurveillanceMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateSyndromicSurveillanceMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
