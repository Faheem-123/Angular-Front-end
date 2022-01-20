import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimAgingComponent } from './claim-aging.component';

describe('ClaimAgingComponent', () => {
  let component: ClaimAgingComponent;
  let fixture: ComponentFixture<ClaimAgingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimAgingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
