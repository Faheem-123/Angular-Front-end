import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderWiseTemplatesComponent } from './provider-wise-templates.component';

describe('ProviderWiseTemplatesComponent', () => {
  let component: ProviderWiseTemplatesComponent;
  let fixture: ComponentFixture<ProviderWiseTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderWiseTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderWiseTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
