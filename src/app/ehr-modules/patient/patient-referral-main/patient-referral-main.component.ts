import { Component, OnInit,Input } from '@angular/core';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap/tabset/tabset';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';

@Component({
  selector: 'patient-referral-main',
  templateUrl: './patient-referral-main.component.html',
  styleUrls: ['./patient-referral-main.component.css']
})
export class PatientReferralMainComponent implements OnInit {
  @Input() patientId;
  @Input() patient:PatientToOpen;

  loadPayment: boolean = false;
  loadReason: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  onTabChange(event: NgbTabChangeEvent) {
    debugger;

    switch (event.nextId) {
      case 'tab-pat-payment':
      this.loadPayment = true;
      break;
      case 'tab-not-paid-reason':
      this.loadReason = true;
      break;
    }
  }
}
