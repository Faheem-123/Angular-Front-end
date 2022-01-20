import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimSuperBillComponent } from './claim-super-bill.component';

describe('ClaimSuperBillComponent', () => {
  let component: ClaimSuperBillComponent;
  let fixture: ComponentFixture<ClaimSuperBillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimSuperBillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimSuperBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
