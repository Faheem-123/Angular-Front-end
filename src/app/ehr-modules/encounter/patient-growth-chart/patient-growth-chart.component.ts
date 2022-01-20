import { Component, OnInit, Input, Inject } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';


@Component({
  selector: 'patient-growth-chart',
  templateUrl: './patient-growth-chart.component.html',
  styleUrls: ['./patient-growth-chart.component.css']
})
export class PatientGrowthChartComponent implements OnInit {

  @Input() patientId;
  @Input() openPatientInfo;
  lstVitalData;
  
  
  chartName='';
  constructor(private encounterService: EncounterService,@Inject(LOOKUP_LIST) public lookupList: LookupList) {
  
   }
   getVitalData(){
    this.encounterService.getGrowthChartData(this.lookupList.practiceInfo.practiceId.toString(),this.patientId)
        .subscribe(
          data => {
            debugger;
            this.lstVitalData = data;
            this.generalOnChange('Birth_Weight_For_Age')
          },
          error => {
            // this.logMessage.log("An Error Occured while getting Asthma Exam list.")
            // this.isLoading = false;
          }
        )
  }
  ngOnInit() {
    this.getVitalData();
  }
  
  generalOnChange(value)
  {
    this.chartName=value;    
  }

}
