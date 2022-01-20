import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteOffSetupComponent } from './write-off-setup.component';

describe('WriteOffSetupComponent', () => {
  let component: WriteOffSetupComponent;
  let fixture: ComponentFixture<WriteOffSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteOffSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOffSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
