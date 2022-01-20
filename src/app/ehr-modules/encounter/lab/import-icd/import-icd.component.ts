import { Component, OnInit, Inject, Input } from '@angular/core';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'import-icd',
  templateUrl: './import-icd.component.html',
  styleUrls: ['./import-icd.component.css']
})
export class ImportIcdComponent implements OnInit {
  @Input() patient_id;
  @Input() chart_id;
  lstChartDiagnosis;
  constructor(private encounterService:EncounterService,private generalOperation: GeneralOperation,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.encounterService.getChartDiagnosis(this.patient_id.toString(),this.chart_id.toString()).subscribe(
      data => {
        this.lstChartDiagnosis = data;
      },
      error => {
        //this.logMessage.log("An Error Occured while getChartDiagnosis.")
      }
    );
  }
  importSingleSelect(value, doc) {
    this.lstChartDiagnosis[this.generalOperation.getElementIndex(this.lstChartDiagnosis, doc)].chk = value;
  }
  importSelectAll(value) {
    for (var i = 0; i < this.lstChartDiagnosis.length; i++) {
      this.lstChartDiagnosis[i].chk = value;
    }
  }
  arrOrderIcd:any;
  onImportOK(){
    this.arrOrderIcd=new Array();
    for (var i = 0; i < this.lstChartDiagnosis.length; i++) 
    {
      if(this.lstChartDiagnosis[i].chk==true)
      this.arrOrderIcd.push({
        diagnosise_id:'',
        order_id:"",
        diag_code: this.lstChartDiagnosis[i].code,
        diag_description: this.lstChartDiagnosis[i].description,
        diagdetail: this.lstChartDiagnosis[i].code+" ("+this.lstChartDiagnosis[i].description+")",
        code_type:"ICD-10",
        sequence: this.arrOrderIcd.length + 1,
        deleted:"false",
        created_user:"",
        client_date_created:"",
        modified_user:"",
        client_date_modified:"",
        date_created:"",
        date_modified:""
      });
    }
    this.activeModal.close(this.arrOrderIcd)
  }

}
