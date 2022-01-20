import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EhrMainComponent } from './ehr-main.component';

describe('EhrMainComponent', () => {
  let component: EhrMainComponent;
  let fixture: ComponentFixture<EhrMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EhrMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EhrMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
