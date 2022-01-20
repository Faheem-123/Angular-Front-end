import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdiClaimStatusDetailComponent } from './edi-claim-status-detail.component';

describe('EdiClaimStatusDetailComponent', () => {
  let component: EdiClaimStatusDetailComponent;
  let fixture: ComponentFixture<EdiClaimStatusDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdiClaimStatusDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdiClaimStatusDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
