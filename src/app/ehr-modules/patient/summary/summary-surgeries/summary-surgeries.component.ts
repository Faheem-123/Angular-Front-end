import { Component, OnInit,Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-surgeries',
  templateUrl: './summary-surgeries.component.html',
  styleUrls: ['./summary-surgeries.component.css']
})
export class SummarySurgeriesComponent implements OnInit {

  @Input() patientId;
  lstSurgeries;
  isLoding: boolean = true;

  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.getSuregeriesSummary();
  }

  getSuregeriesSummary() {
    this.isLoding = true;
    this.lstSurgeries = undefined;
    this.patientService.getSuregeriesProceduresSummary(this.patientId,'SURGERIES').subscribe(
      data => {
        this.isLoding = false;
        this.lstSurgeries = data;
      },
      error => {
        this.isLoding = false;
        this.ongetSuregeriesSummaryError(error);
      }
    );
  }
  ongetSuregeriesSummaryError(error) {
    this.logMessage.log("getAllergiesSummary Error.");
  }

}
