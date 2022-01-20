import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsthmaExamComponent } from './asthma-exam.component';

describe('AsthmaExamComponent', () => {
  let component: AsthmaExamComponent;
  let fixture: ComponentFixture<AsthmaExamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsthmaExamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsthmaExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
