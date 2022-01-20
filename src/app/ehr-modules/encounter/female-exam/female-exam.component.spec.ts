import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FemaleExamComponent } from './female-exam.component';

describe('FemaleExamComponent', () => {
  let component: FemaleExamComponent;
  let fixture: ComponentFixture<FemaleExamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FemaleExamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FemaleExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
