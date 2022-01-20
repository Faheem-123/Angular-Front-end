import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-medication',
  templateUrl: './summary-medication.component.html',
  styleUrls: ['./summary-medication.component.css']
})
export class SummaryMedicationComponent implements OnInit {

  @Input() patientId;
  lstMedication;
  isLoding: boolean = true;

  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {

    this.getMedicationSummary();
  }

  getMedicationSummary() {
    this.isLoding = true;
    this.lstMedication = undefined;
    this.patientService.getMedicationSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;
        this.lstMedication = data;
      },
      error => {
        this.isLoding = false;
        this.onMedicationSummaryError(error);
      }
    );
  }
  onMedicationSummaryError(error) {
    this.logMessage.log("getMedicationSummary Error.");
  }

}
