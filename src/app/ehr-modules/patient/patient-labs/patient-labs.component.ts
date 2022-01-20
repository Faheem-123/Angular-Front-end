import { Component, OnInit, Input } from '@angular/core';
import { OpenedPatientInfo } from 'src/app/models/common/patientInfo';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'patient-labs',
  templateUrl: './patient-labs.component.html',
  styleUrls: ['./patient-labs.component.css']
})
export class PatientLabsComponent implements OnInit {
  @Input() patientId;
  @Input() openPatientInfo:OpenedPatientInfo;
  constructor() { }

  ngOnInit() {
    //console.log(this.patientId);
    
  }
  onTabChange(event: NgbTabChangeEvent) {
    
  }

}
