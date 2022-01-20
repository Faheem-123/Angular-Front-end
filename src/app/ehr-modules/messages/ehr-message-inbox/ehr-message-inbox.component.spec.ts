import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EhrMessageInboxComponent } from './ehr-message-inbox.component';

describe('EhrMessageInboxComponent', () => {
  let component: EhrMessageInboxComponent;
  let fixture: ComponentFixture<EhrMessageInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EhrMessageInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EhrMessageInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
