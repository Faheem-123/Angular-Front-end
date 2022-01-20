import { Component, OnInit,Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-consults',
  templateUrl: './summary-consults.component.html',
  styleUrls: ['./summary-consults.component.css']
})
export class SummaryConsultsComponent implements OnInit {

  @Input() patientId;
  lstConsults; 
  isLoding: boolean = true;
  
  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.getConsultSummary();
  }

  getConsultSummary() {
    this.isLoding = true;
    this.lstConsults = undefined;
    this.patientService.getConsultSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;   
        this.lstConsults = data;;
      },
      error => {
        this.isLoding = false;
        this.ongetConsultSummaryError(error);
      }
    );
  }
  ongetConsultSummaryError(error) {
    this.logMessage.log("ongetConsultSummary Error.");
  }

}
