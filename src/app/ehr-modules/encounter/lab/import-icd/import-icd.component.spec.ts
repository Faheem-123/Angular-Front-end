import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportIcdComponent } from './import-icd.component';

describe('ImportIcdComponent', () => {
  let component: ImportIcdComponent;
  let fixture: ComponentFixture<ImportIcdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportIcdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportIcdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
