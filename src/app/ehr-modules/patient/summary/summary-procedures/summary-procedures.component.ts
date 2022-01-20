import { Component, OnInit,Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-procedures',
  templateUrl: './summary-procedures.component.html',
  styleUrls: ['./summary-procedures.component.css']
})
export class SummaryProceduresComponent implements OnInit {

  @Input() patientId;
  lstProcedures;
  lstProceduresUnique;
  isLoding: boolean = true;

  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.getProceduresSummary();
  }

  getProceduresSummary() {
    this.isLoding = true;
    this.lstProcedures = undefined;
    this.lstProceduresUnique=undefined;
    this.patientService.getSuregeriesProceduresSummary(this.patientId,'PROCEDURES').subscribe(
      data => {
        this.isLoding = false;
        this.lstProceduresUnique=data;
        this.lstProcedures = data;
      },
      error => {
        this.isLoding = false;
        this.ongetProceduresSummaryError(error);
      }
    );
  }
  ongetProceduresSummaryError(error) {
    this.logMessage.log("getAllergiesSummary Error.");
  }


}
