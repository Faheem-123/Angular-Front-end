import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { procedureSetupComponent } from './procedure-Setup.component';

describe('ProcedureComponent', () => {
  let component: procedureSetupComponent;
  let fixture: ComponentFixture<procedureSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ procedureSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(procedureSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
