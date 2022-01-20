import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperBillItemComponent } from './super-bill-item.component';

describe('SuperBillItemComponent', () => {
  let component: SuperBillItemComponent;
  let fixture: ComponentFixture<SuperBillItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperBillItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperBillItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
