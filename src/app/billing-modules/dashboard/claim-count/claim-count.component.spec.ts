import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimCountComponent } from './claim-count.component';

describe('ClaimCountComponent', () => {
  let component: ClaimCountComponent;
  let fixture: ComponentFixture<ClaimCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
