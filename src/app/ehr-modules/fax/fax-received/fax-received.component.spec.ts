import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaxReceivedComponent } from './fax-received.component';

describe('FaxReceivedComponent', () => {
  let component: FaxReceivedComponent;
  let fixture: ComponentFixture<FaxReceivedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaxReceivedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaxReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
