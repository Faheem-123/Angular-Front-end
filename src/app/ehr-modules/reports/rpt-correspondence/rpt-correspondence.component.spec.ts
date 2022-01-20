import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptCorrespondenceComponent } from './rpt-correspondence.component';

describe('RptCorrespondenceComponent', () => {
  let component: RptCorrespondenceComponent;
  let fixture: ComponentFixture<RptCorrespondenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptCorrespondenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
