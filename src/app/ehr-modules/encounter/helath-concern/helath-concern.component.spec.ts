import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelathConcernComponent } from './helath-concern.component';

describe('HelathConcernComponent', () => {
  let component: HelathConcernComponent;
  let fixture: ComponentFixture<HelathConcernComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelathConcernComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelathConcernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
