import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptProviderWiseCollectionComponent } from './rpt-provider-wise-collection.component';

describe('RptProviderWiseCollectionComponent', () => {
  let component: RptProviderWiseCollectionComponent;
  let fixture: ComponentFixture<RptProviderWiseCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptProviderWiseCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptProviderWiseCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
