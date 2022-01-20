import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportIcdCptComponent } from './import-icd-cpt.component';

describe('ImportIcdCptComponent', () => {
  let component: ImportIcdCptComponent;
  let fixture: ComponentFixture<ImportIcdCptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportIcdCptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportIcdCptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
