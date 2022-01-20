import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptSourceWiseCollectionComponent } from './rpt-source-wise-collection.component';

describe('RptSourceWiseCollectionComponent', () => {
  let component: RptSourceWiseCollectionComponent;
  let fixture: ComponentFixture<RptSourceWiseCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptSourceWiseCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptSourceWiseCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
