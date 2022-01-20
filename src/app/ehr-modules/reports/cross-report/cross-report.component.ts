import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ReportsService } from 'src/app/services/reports.service';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';

@Component({
  selector: 'cross-report',
  templateUrl: './cross-report.component.html',
  styleUrls: ['./cross-report.component.css']
})
export class CrossReportComponent implements OnInit {
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;
  lstOrderCross;
  dateFrom;
  dateTo;
  frmCallSubmit: FormGroup;
  recordCount;
  recordCountComp;
  frmlabComplate:FormGroup;
  lstOrderComp;
  dateFromComp;
  dateToComp;
  txtPatientSearch;


  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,
    private dateTimeUtil:DateTimeUtil, 
    private formBuilder:FormBuilder,
    private reportsService:ReportsService,
    private logMessage: LogMessage) { }

  ngOnInit() {
    this.buildForm();
    this.buildLabForm();
  }

  buildForm(){
    this.frmCallSubmit = this.formBuilder.group({
      dateFrom: this.formBuilder.control(null, Validators.required),
      dateTo: this.formBuilder.control(null, Validators.required),
    })
  }

  buildLabForm(){
    this.frmlabComplate = this.formBuilder.group({
      dateFromComp : this.formBuilder.control(null, Validators.required),
      dateToComp: this.formBuilder.control(null, Validators.required),
      txtPatientSearch: this.formBuilder.control(null),
    })
  }

  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
    

      this.patientId = undefined;
    }
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.frmlabComplate.get("txtPatientSearch").setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject) { 
    debugger;   
    this.logMessage.log(patObject);
    
    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;
    
    (this.frmlabComplate.get('txtPatientSearch') as FormControl).setValue(this.patientName);

    this.showPatientSearch = false;

  }
  closePatientSearch(){
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  searchCallData(formData){
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list=[];
    
    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    searchCriteria.param_list.push( { name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push( { name: "dateTo", value: vardateTo, option: "" });
    
    this.reportsService.getCrossReport(searchCriteria).subscribe(
      data => { this.lstOrderCross = data;
        this.recordCount=this.lstOrderCross['length'];},
      error =>{
        debugger;
        this.logMessage.showErrorMessage(error.message);
      });
    }

    searchCompData(formData){
      debugger;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list=[];
      
      let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFromComp);
      let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateToComp);
  
      searchCriteria.param_list.push( { name: "dateFrom", value: vardateFrom, option: "" });
      searchCriteria.param_list.push( { name: "dateTo", value: vardateTo, option: "" });
      searchCriteria.param_list.push( { name: "patientID", value: this.patientId, option: "" });
      
      this.reportsService.getLabCompRpt(searchCriteria).subscribe(
        data => { this.lstOrderComp = data;
          this.recordCountComp=this.lstOrderComp['length'];},
        error =>{
          debugger;
          this.logMessage.showErrorMessage(error.message);
        });
      }

      
}
