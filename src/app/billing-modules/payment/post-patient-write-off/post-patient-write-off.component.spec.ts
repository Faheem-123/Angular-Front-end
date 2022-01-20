import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPatientWriteOffComponent } from './post-patient-write-off.component';

describe('PostPatientWriteOffComponent', () => {
  let component: PostPatientWriteOffComponent;
  let fixture: ComponentFixture<PostPatientWriteOffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostPatientWriteOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPatientWriteOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
