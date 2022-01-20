import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHealthMaintPopupComponent } from './new-health-maint-popup.component';

describe('NewHealthMaintPopupComponent', () => {
  let component: NewHealthMaintPopupComponent;
  let fixture: ComponentFixture<NewHealthMaintPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewHealthMaintPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewHealthMaintPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
