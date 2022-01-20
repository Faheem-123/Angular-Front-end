import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PmhComponent } from './pmh.component';

describe('PmhComponent', () => {
  let component: PmhComponent;
  let fixture: ComponentFixture<PmhComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PmhComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
