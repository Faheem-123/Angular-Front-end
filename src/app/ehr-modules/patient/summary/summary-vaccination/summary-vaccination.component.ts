import { Component, OnInit, Input, Inject } from '@angular/core';
import { PatientService } from '../../../../services/patient/patient.service';
import { LogMessage } from '../../../../shared/log-message';
import { SearchCriteria } from '../../../../models/common/search-criteria';
import { LookupList, LOOKUP_LIST } from '../../../../providers/lookupList.module';
import { EncounterService } from 'src/app/services/encounter/encounter.service';

@Component({
  selector: 'summary-vaccination',
  templateUrl: './summary-vaccination.component.html',
  styleUrls: ['./summary-vaccination.component.css']
})
export class SummaryVaccinationComponent implements OnInit {


  @Input() patientId:number;
  lstImmunizationUnique:Array<any>;
  lstImmunization:Array<any>;
  isLoding: boolean = true;

  constructor(private encounterService: EncounterService,
    private logMessage: LogMessage,
    @Inject(LOOKUP_LIST) public lookupList: LookupList) { }


  ngOnInit() {

    this.getImmunizationSummary();
  }

  getImmunizationSummary() {
    this.isLoding = true;
    this.lstImmunization = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" },
      { name: "chart_id", value: '', option: "" },// chart id empty to get all 
      { name: "chart_immunization_ids", value: "", option: "" },// chart_immunization_ids empty to get all 
      { name: "include_deleted", value: false, option: "" }
    ];



    this.encounterService.getChartImmunizationSummary(searchCriteria).subscribe(
      data => {
        this.isLoding = false;
        this.lstImmunization = data as Array<any>;
        this.lstImmunizationUnique = data as Array<any>;
      },
      error => {
        this.isLoding = false;
        this.onImmunizationSummaryError(error);
      }
    );
  }
  onImmunizationSummaryError(error) {
    this.logMessage.log("getImmunizationSummary Error.");
  }

}
