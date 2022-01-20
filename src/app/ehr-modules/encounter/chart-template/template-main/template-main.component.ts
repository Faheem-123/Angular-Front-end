import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EncounterToOpen } from 'src/app/models/encounter/EncounterToOpen';
import { patientTemplateData } from 'src/app/models/encounter/patientTemplateData';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { LogMessage } from 'src/app/shared/log-message';

@Component({
  selector: 'template-main',
  templateUrl: './template-main.component.html',
  styleUrls: ['./template-main.component.css'],
  encapsulation: ViewEncapsulation.None,
  styles: [`
  @media screen {
      .modal-adaptive .modal-lg {
          width: 80% !important;
          max-width: calc(80%);
      }
    `]
 
})
export class TemplateMainComponent implements OnInit {

  @Input() objencounterToOpen:EncounterToOpen;
  //@Input() objpatientTemplateData:patientTemplateData;
  @Input() callingFrom='';
  @Input() module_txt='';
  chartVital;
  objpatientTemplateData:patientTemplateData;
  constructor(public activeModal: NgbActiveModal,private modalService: NgbModal,
    private encounterService: EncounterService, private logMessage: LogMessage) { }

  ngOnInit() {
    this.getChartVital();
  }
  getChartVital() {
    this.encounterService.getChartVital(Number(this.objencounterToOpen.chart_id))
      .subscribe(
        data => {
          debugger;
          this.chartVital = data;
          this.objpatientTemplateData=new patientTemplateData();
          
          this.objpatientTemplateData.patient_name=this.objencounterToOpen.patient_name;
          this.objpatientTemplateData.patient_age=this.objencounterToOpen.openPatientInfo.patient_age;
          this.objpatientTemplateData.patient_dob_101=this.objencounterToOpen.openPatientInfo.patient_dob_101;
          this.objpatientTemplateData.patient_gender=this.objencounterToOpen.openPatientInfo.patient_gender;

          this.objpatientTemplateData.provider_name=this.objencounterToOpen.provider_name;
          this.objpatientTemplateData.location_name=this.objencounterToOpen.location_name;
          this.objpatientTemplateData.visit_date=this.objencounterToOpen.visit_date;
          if(this.chartVital!=null && this.chartVital!=undefined)
          {
            if (this.chartVital.height_feet != undefined && this.chartVital.height_feet != "") {
              this.objpatientTemplateData.height = this.chartVital.height_feet.toString().split(".")[0];
              //this.height_inc = this.chartVital.height_feet.toString().split(".")[1];
            }
            else{
              this.objpatientTemplateData.height="";
            }
      
            if (this.chartVital.weight_lbs != undefined && this.chartVital.weight_lbs != "") {
              this.objpatientTemplateData.weight= this.chartVital.weight_lbs.toString().split(".")[0];//lbs
              //this.weight_ozs = this.chartVital.weight_lbs.toString().split(".")[1];
            }
            else{
              this.objpatientTemplateData.weight="";
            }
            this.objpatientTemplateData.bmi = this.chartVital.bmi;
            this.objpatientTemplateData.blood_pressure= this.chartVital.systolic_bp1+'/'+this.chartVital.diastolic_bp1;
            this.objpatientTemplateData.oxygen_saturation= this.chartVital.oxygen_saturation;
            this.objpatientTemplateData.pulse= this.chartVital.pulse;
            this.objpatientTemplateData.pulse= this.chartVital.pulse;
            this.objpatientTemplateData.smoking_status="";
          }
        },
        error => alert(error),
        () => this.logMessage.log("get vitals Successfull.")
      );
  }
}
