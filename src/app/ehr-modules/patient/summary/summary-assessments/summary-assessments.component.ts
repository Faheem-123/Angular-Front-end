import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';

@Component({
  selector: 'summary-assessments',
  templateUrl: './summary-assessments.component.html',
  styleUrls: ['./summary-assessments.component.css']
})
export class SummaryAssessmentsComponent implements OnInit {

  @Input() patientId;
  lstAssessments;
  isLoding: boolean = true;

  constructor(private patientService: PatientService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.getAssessmentSummary();
  }


  getAssessmentSummary() {
    this.isLoding = true;
    this.lstAssessments = undefined;
    this.patientService.getAssessmentSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;
        this.lstAssessments = data;
      },
      error => {
        this.isLoding = false;
        this.onAssessmentSummaryError(error);
      }
    );
  }
  onAssessmentSummaryError(error) {
    this.logMessage.log("getAssessmentSummary Error.");
  }
}
