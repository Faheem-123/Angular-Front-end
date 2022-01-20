import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyClaimStatusComponent } from './modify-claim-status.component';

describe('ModifyClaimStatusComponent', () => {
  let component: ModifyClaimStatusComponent;
  let fixture: ComponentFixture<ModifyClaimStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyClaimStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyClaimStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
