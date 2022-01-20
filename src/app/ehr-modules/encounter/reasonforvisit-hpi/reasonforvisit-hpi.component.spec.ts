import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonforvisitHpiComponent } from './reasonforvisit-hpi.component';

describe('ReasonforvisitHpiComponent', () => {
  let component: ReasonforvisitHpiComponent;
  let fixture: ComponentFixture<ReasonforvisitHpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReasonforvisitHpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasonforvisitHpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
