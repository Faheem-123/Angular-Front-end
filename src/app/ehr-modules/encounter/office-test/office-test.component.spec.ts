import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeTestComponent } from './office-test.component';

describe('OfficeTestComponent', () => {
  let component: OfficeTestComponent;
  let fixture: ComponentFixture<OfficeTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficeTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
