import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdiClaimStatusComponent } from './edi-claim-status.component';

describe('EdiClaimStatusComponent', () => {
  let component: EdiClaimStatusComponent;
  let fixture: ComponentFixture<EdiClaimStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdiClaimStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdiClaimStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
