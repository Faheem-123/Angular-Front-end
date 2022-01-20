import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MentalOfficetestComponent } from './mental-officetest.component';

describe('MentalOfficetestComponent', () => {
  let component: MentalOfficetestComponent;
  let fixture: ComponentFixture<MentalOfficetestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MentalOfficetestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MentalOfficetestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
