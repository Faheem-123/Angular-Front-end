import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MylistSetupComponent } from './mylist-setup.component';

describe('MylistSetupComponent', () => {
  let component: MylistSetupComponent;
  let fixture: ComponentFixture<MylistSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MylistSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MylistSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
