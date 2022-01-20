import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimStatementComponent } from './claim-statement.component';

describe('ClaimStatementComponent', () => {
  let component: ClaimStatementComponent;
  let fixture: ComponentFixture<ClaimStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
