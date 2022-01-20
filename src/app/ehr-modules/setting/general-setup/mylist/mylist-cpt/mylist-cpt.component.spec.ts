import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MylistCptComponent } from './mylist-cpt.component';

describe('MylistCptComponent', () => {
  let component: MylistCptComponent;
  let fixture: ComponentFixture<MylistCptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MylistCptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MylistCptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
