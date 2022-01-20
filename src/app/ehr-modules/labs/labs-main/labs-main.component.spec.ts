import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabsMainComponent } from './labs-main.component';

describe('LabsMainComponent', () => {
  let component: LabsMainComponent;
  let fixture: ComponentFixture<LabsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
