import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdrRulesComponent } from './cdr-rules.component';

describe('CdrRulesComponent', () => {
  let component: CdrRulesComponent;
  let fixture: ComponentFixture<CdrRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdrRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdrRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
