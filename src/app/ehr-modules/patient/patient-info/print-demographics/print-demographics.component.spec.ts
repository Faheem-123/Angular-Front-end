import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDemographicsComponent } from './print-demographics.component';

describe('PrintDemographicsComponent', () => {
  let component: PrintDemographicsComponent;
  let fixture: ComponentFixture<PrintDemographicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDemographicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDemographicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
