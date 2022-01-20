import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderPayersComponent } from './provider-payers.component';

describe('ProviderPayersComponent', () => {
  let component: ProviderPayersComponent;
  let fixture: ComponentFixture<ProviderPayersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderPayersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderPayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
