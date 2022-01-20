import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysiciansCareComponent } from './physicians-care.component';

describe('PhysiciansCareComponent', () => {
  let component: PhysiciansCareComponent;
  let fixture: ComponentFixture<PhysiciansCareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysiciansCareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysiciansCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
