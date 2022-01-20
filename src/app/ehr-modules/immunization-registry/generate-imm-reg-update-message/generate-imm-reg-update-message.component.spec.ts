import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateImmRegUpdateMessageComponent } from './generate-imm-reg-update-message.component';

describe('GenerateImmRegUpdateMessageComponent', () => {
  let component: GenerateImmRegUpdateMessageComponent;
  let fixture: ComponentFixture<GenerateImmRegUpdateMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateImmRegUpdateMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateImmRegUpdateMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
