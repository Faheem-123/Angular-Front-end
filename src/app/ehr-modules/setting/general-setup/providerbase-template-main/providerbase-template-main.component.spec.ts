import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderbaseTemplateMainComponent } from './providerbase-template-main.component';

describe('ProviderbaseTemplateMainComponent', () => {
  let component: ProviderbaseTemplateMainComponent;
  let fixture: ComponentFixture<ProviderbaseTemplateMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderbaseTemplateMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderbaseTemplateMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
