import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcaComponent } from './aca.component';

describe('AcaComponent', () => {
  let component: AcaComponent;
  let fixture: ComponentFixture<AcaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
