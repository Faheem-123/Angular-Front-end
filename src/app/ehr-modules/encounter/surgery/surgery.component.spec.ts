import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryComponent } from './surgery.component';

describe('SurgeryComponent', () => {
  let component: SurgeryComponent;
  let fixture: ComponentFixture<SurgeryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurgeryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
