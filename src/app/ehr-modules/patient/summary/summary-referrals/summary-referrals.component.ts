import { Component, OnInit,Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-referrals',
  templateUrl: './summary-referrals.component.html',
  styleUrls: ['./summary-referrals.component.css']
})
export class SummaryReferralsComponent implements OnInit {

  @Input() patientId;
  lstReferrals; 
  isLoding: boolean = true;
  
  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.getReferralSummary();
  }

  getReferralSummary() {
    this.isLoding = true;
    this.lstReferrals = undefined;
    this.patientService.getReferralSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;   
        this.lstReferrals = data;;
      },
      error => {
        this.isLoding = false;
        this.ongetReferralSummaryError(error);
      }
    );
  }
  ongetReferralSummaryError(error) {
    this.logMessage.log("ongetReferralSummaryError Error.");
  }


}
