import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EhrMessageComposeComponent } from './ehr-message-compose.component';

describe('EhrMessageComposeComponent', () => {
  let component: EhrMessageComposeComponent;
  let fixture: ComponentFixture<EhrMessageComposeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EhrMessageComposeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EhrMessageComposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
