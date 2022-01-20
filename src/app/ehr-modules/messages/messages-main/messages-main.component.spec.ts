import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesMainComponent } from './messages-main.component';

describe('MessagesMainComponent', () => {
  let component: MessagesMainComponent;
  let fixture: ComponentFixture<MessagesMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
