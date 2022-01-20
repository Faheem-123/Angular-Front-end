import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaxMainComponent } from './fax-main.component';

describe('FaxMainComponent', () => {
  let component: FaxMainComponent;
  let fixture: ComponentFixture<FaxMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaxMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaxMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
