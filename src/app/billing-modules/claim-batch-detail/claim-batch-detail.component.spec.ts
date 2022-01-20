import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimBatchDetailComponent } from './claim-batch-detail.component';

describe('ClaimBatchDetailComponent', () => {
  let component: ClaimBatchDetailComponent;
  let fixture: ComponentFixture<ClaimBatchDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimBatchDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimBatchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
