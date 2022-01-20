import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'patient-task-data',
  templateUrl: './patient-task-data.component.html',
  styleUrls: ['./patient-task-data.component.css']
})
export class PatientTaskDataComponent implements OnInit {
  @Input() lstData:string;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

}
