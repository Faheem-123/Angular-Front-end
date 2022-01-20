import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-allergies',
  templateUrl: './summary-allergies.component.html',
  styleUrls: ['./summary-allergies.component.css']
})
export class SummaryAllergiesComponent implements OnInit {

  @Input() patientId;
  lstAllergies;
  isLoding: boolean = true;

  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.getAllergiesSummary();
  }

  getAllergiesSummary() {
    this.isLoding = true;
    this.lstAllergies = undefined;
    this.patientService.getAllergiesSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;
        this.lstAllergies = data;
      },
      error => {
        this.isLoding = false;
        this.onAllergiesSummaryError(error);
      }
    );
  }
  onAllergiesSummaryError(error) {
    this.logMessage.log("getAllergiesSummary Error.");
  }

}
