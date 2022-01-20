import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MylistIcdComponent } from './mylist-icd.component';

describe('MylistIcdComponent', () => {
  let component: MylistIcdComponent;
  let fixture: ComponentFixture<MylistIcdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MylistIcdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MylistIcdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
