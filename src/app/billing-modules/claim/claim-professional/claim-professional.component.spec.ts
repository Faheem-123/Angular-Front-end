import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimProfessionalComponent } from './claim-professional.component';

describe('ClaimProfessionalComponent', () => {
  let component: ClaimProfessionalComponent;
  let fixture: ComponentFixture<ClaimProfessionalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimProfessionalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
