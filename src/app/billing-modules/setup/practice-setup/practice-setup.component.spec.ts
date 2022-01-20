import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeSetupComponent } from './practice-setup.component';

describe('PracticeSetupComponent', () => {
  let component: PracticeSetupComponent;
  let fixture: ComponentFixture<PracticeSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
