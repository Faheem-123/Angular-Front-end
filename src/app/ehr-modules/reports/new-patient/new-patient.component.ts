import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ReportsService } from 'src/app/services/reports.service';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'new-patient',
  templateUrl: './new-patient.component.html',
  styleUrls: ['./new-patient.component.css']
})
export class NewPatientComponent implements OnInit {
  frmPregSubmit: FormGroup;
  providerId;
  locationId;
  dateFrom;
  dateTo;
  lstNewPatient;
  reportType;
  rbPregComp;
  searchOption;
  criteria;
  recordCount;
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
  private formBuilder:FormBuilder,
  private reportsService:ReportsService,
  private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {
    this.buildForm();
  }
  
  buildForm(){
    this.frmPregSubmit = this.formBuilder.group({
      dateFrom: this.formBuilder.control(null, Validators.required),
      dateTo: this.formBuilder.control(null, Validators.required),
      cmbProvider: this.formBuilder.control(null),
      cmbCriteria: this.formBuilder.control('By Claim'),
      cmbLocation: this.formBuilder.control(null),
    })
  }

  searchNewPatient(formData)
  {
    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list=[];

    let fromDate = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let toDate = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    searchCriteria.param_list.push( { name: "fromDate", value: fromDate, option: "" });
    searchCriteria.param_list.push( { name: "dateTo", value: toDate, option: "" });
    searchCriteria.param_list.push( { name: "cmbProvider", value: (this.frmPregSubmit.get('cmbProvider') as FormControl).value, option: "" });
    searchCriteria.param_list.push( { name: "cmbCriteria", value: formData.cmbCriteria , option: "" });
    searchCriteria.param_list.push( { name: "cmbLocation", value: (this.frmPregSubmit.get('cmbLocation') as FormControl).value, option: "" });
    


    this.reportsService.getPatCreation(searchCriteria).subscribe(
      data => { this.lstNewPatient = data;
        this.recordCount=this.lstNewPatient['length'];},
      error =>{
        debugger;
        alert('Error is :'+error.message);});    
}

  cmbChagne(event){
    this.reportType=event.currentTarget.value;
  }

}
