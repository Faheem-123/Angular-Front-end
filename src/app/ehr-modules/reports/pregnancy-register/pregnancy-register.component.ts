import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReportsService } from 'src/app/services/reports.service';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';

@Component({
  selector: 'pregnancy-register',
  templateUrl: './pregnancy-register.component.html',
  styleUrls: ['./pregnancy-register.component.css']
})
export class PregnancyRegisterComponent implements OnInit {

  frmPregSubmit: FormGroup;
  providerId;
  dateFrom;
  dateTo;
  lstPregnancy;
  reportType;
  //cmbCriteria;
  rbPregComp;
  searchOption;
  save_criteria;
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
      cmbCriteria: this.formBuilder.control('Registered Date'),
      rbPregComp: this.formBuilder.control(null)
    })
  }

  searchPregnancy(formData)
  {
    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list=[];

    let fromDate = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let toDate = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    searchCriteria.param_list.push( { name: "fromDate", value: fromDate, option: "" });
    searchCriteria.param_list.push( { name: "dateTo", value: toDate, option: "" });
    searchCriteria.param_list.push( { name: "cmbProvider", value: formData.cmbProvider, option: "" });
    searchCriteria.param_list.push( { name: "cmbCriteria", value: formData.cmbCriteria , option: "" });
    searchCriteria.param_list.push( { name: "rbPregComp", value: formData.rbPregComp, option: "" });
    
    this.reportsService.getPregData(searchCriteria).subscribe(
      data => { this.lstPregnancy = data;
        this.recordCount=this.lstPregnancy['length'];},
      error =>{
        debugger;
        alert('Error is :'+error.message);});    
}

  cmbChagne(event){
    this.reportType=event.currentTarget.value;
  }

  
}
