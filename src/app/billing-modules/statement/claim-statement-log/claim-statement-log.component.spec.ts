import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimStatementLogComponent } from './claim-statement-log.component';

describe('ClaimStatementLogComponent', () => {
  let component: ClaimStatementLogComponent;
  let fixture: ComponentFixture<ClaimStatementLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimStatementLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimStatementLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
