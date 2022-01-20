import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'summary-health-maintenance',
  templateUrl: './summary-health-maintenance.component.html',
  styleUrls: ['./summary-health-maintenance.component.css'],
})
export class SummaryHealthMaintenanceComponent implements OnInit {


  @Input() patientId;
  lstHealthMaintenance;
  isLoding: boolean = true;
  radioOption = "all";



  radioForm: FormGroup;

  constructor(private patientService: PatientService,
    private logMessage: LogMessage,
    private formBuilder: FormBuilder) { }


  ngOnInit() {
    this.getHealthMaintenanceSummary();

    this.radioForm = this.formBuilder.group({
      entryOption: this.formBuilder.control(this.radioOption)
    });
  }


  getHealthMaintenanceSummary() {
    this.isLoding = true;
    this.lstHealthMaintenance = undefined;
    this.patientService.getHealthMaintenanceSummary(this.patientId).subscribe(
      data => {
        this.isLoding = false;
        this.lstHealthMaintenance = data;;
      },
      error => {
        this.isLoding = false;
        this.onHealthMaintenanceSummaryError(error);
      }
    );
  }
  onHealthMaintenanceSummaryError(error) {
    this.logMessage.log("getImmunizationSummary Error.");
  }

  onOptionChange(event) {
    debugger;

    this.radioOption = event;
  }

}
