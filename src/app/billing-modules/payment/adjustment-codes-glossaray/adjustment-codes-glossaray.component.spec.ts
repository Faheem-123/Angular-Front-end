import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentCodesGlossarayComponent } from './adjustment-codes-glossaray.component';

describe('AdjustmentCodesGlossarayComponent', () => {
  let component: AdjustmentCodesGlossarayComponent;
  let fixture: ComponentFixture<AdjustmentCodesGlossarayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustmentCodesGlossarayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentCodesGlossarayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
