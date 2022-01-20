import { Component, OnInit,Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-conception-outcomes',
  templateUrl: './summary-conception-outcomes.component.html',
  styleUrls: ['./summary-conception-outcomes.component.css']
})
export class SummaryConceptionOutcomesComponent implements OnInit {

  @Input() patientId;
  lstOutcomes; 
  edd;
  isLoding: boolean = true;  
  
  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }


  ngOnInit() {

   this.refreshSummary();
  }

  refreshSummary(){
    this.getOutcomesSummary();
    this.getEDD();
  }

  getOutcomesSummary() {
    this.isLoding = true;
    this.lstOutcomes = undefined;
    this.patientService.getConceptionOutcomesSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;   
        this.lstOutcomes = data;;
      },
      error => {
        this.isLoding = false;
        this.ongetOutcomesSummaryError(error);
      }
    );
  }
  ongetOutcomesSummaryError(error) {
    this.logMessage.log("ongetOutcomesSummaryError Error.");
  }

  getEDD() {
    this.patientService.getEDD(this.patientId).subscribe(
      data => {      
        debugger;
        this.edd = data['edd'];
      },
      error => {
        debugger;
        this.isLoding = false;
        this.ongetEDDError(error);
      }
    );
  }
  ongetEDDError(error) {
    this.logMessage.log("ongetEDDError Error.");
  }
}
