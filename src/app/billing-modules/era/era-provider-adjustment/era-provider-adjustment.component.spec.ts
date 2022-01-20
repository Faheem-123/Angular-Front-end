import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EraProviderAdjustmentComponent } from './era-provider-adjustment.component';

describe('EraProviderAdjustmentComponent', () => {
  let component: EraProviderAdjustmentComponent;
  let fixture: ComponentFixture<EraProviderAdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EraProviderAdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EraProviderAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
