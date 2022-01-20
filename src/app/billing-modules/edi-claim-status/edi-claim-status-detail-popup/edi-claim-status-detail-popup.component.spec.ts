import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdiClaimStatusDetailPopupComponent } from './edi-claim-status-detail-popup.component';

describe('EdiClaimStatusDetailPopupComponent', () => {
  let component: EdiClaimStatusDetailPopupComponent;
  let fixture: ComponentFixture<EdiClaimStatusDetailPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdiClaimStatusDetailPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdiClaimStatusDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
