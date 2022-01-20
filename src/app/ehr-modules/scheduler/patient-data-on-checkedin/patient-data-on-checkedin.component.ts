import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'patient-data-on-checkedin',
  templateUrl: './patient-data-on-checkedin.component.html',
  styleUrls: ['./patient-data-on-checkedin.component.css']
})
export class PatientDataOnCheckedinComponent implements OnInit {

  @Input() lstdata;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    debugger;
  }

}
