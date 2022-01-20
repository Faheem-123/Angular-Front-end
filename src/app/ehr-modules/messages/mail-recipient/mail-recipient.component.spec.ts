import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailRecipientComponent } from './mail-recipient.component';

describe('MailRecipientComponent', () => {
  let component: MailRecipientComponent;
  let fixture: ComponentFixture<MailRecipientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailRecipientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
