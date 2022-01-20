import { Component, OnInit, Inject } from '@angular/core';
import { LogMessage } from 'src/app/shared/log-message';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { ReportsService } from 'src/app/services/reports.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { excelService } from 'src/app/shared/excelService';

@Component({
  selector: 'rpt-patient-notpaid-reason',
  templateUrl: './rpt-patient-notpaid-reason.component.html',
  styleUrls: ['./rpt-patient-notpaid-reason.component.css']
})
export class RptPatientNotpaidReasonComponent implements OnInit {
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;
  patnotpaidForm: FormGroup;
  acAuthorizedBy: Array<any>;
  lstnotpaidReason: Array<any>;
  isLoading: boolean = false;
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList,private modalService: NgbModal,
    private logMessage: LogMessage, private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,
    private reportsService: ReportsService,private excel: excelService) { }

    poupUpOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    
  ngOnInit() {
    this.buildForm();
    this.getAuthorizationUsers();
  }

  buildForm() {
    this.patnotpaidForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      cmbAuthBy: this.formBuilder.control(null),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null)
    })
  }
  getAuthorizationUsers() {
    this.reportsService.getAuthorizationUsers(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        acAuthorizedBy: new Array();
        this.acAuthorizedBy = data as Array<any>;
      },
      error => {
        this.getAuthorizationUsersError(error);
      }
    );
  }
  getAuthorizationUsersError(error) {
    this.logMessage.log("getAuthorizationUsers Error." + error);
  }
  //pateintsearchstart
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
    this.patnotpaidForm.get("txtPatientIdHidden").setValue(null);
  }
}
onPatientSearchBlur() {
  this.logMessage.log("onPatientSearchBlur");
  if (this.patientId == undefined && this.showPatientSearch == false) {
    this.patientName = undefined;
    this.patnotpaidForm.get("txtPatientSearch").setValue(null);
    this.patnotpaidForm.get("txtPatientIdHidden").setValue(null);
  }
}
openSelectPatient(patObject) {
  this.logMessage.log(patObject);
  if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
    const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = "Appointment"
    modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
    modalRef.result.then((result) => {
      //alert(result);
      if (result === PromptResponseEnum.OK) {
        this.closePatientSearch();
      }
    }
      , (reason) => {
        //alert(reason);
      });
    return;
  }
  this.patientId = patObject.patient_id;
  this.patientName = patObject.name;
  (this.patnotpaidForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
  (this.patnotpaidForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);
  this.showPatientSearch = false;
}
closePatientSearch() {
  this.showPatientSearch = false;
  this.onPatientSearchBlur();
}
  // pateintsearchend
  searchNotPaidReason(formData){
    if (formData.dateFrom == undefined || formData.dateFrom == "" || formData.dateTo == undefined || formData.dateTo == ""){
      GeneralOperation.showAlertPopUp(this.modalService, 'Not Paid Reason Search', 'Please select any Date.', 'warning');
      return false;
    }
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];

    let vardateFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dateFrom);
    let vardateTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dateTo);

    searchCriteria.param_list.push({ name: "dateFrom", value: vardateFrom, option: "" });
    searchCriteria.param_list.push({ name: "dateTo", value: vardateTo, option: "" });
    searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
    searchCriteria.param_list.push({ name: "authorizedby", value: (this.patnotpaidForm.get('cmbAuthBy') as FormControl).value, option: "" });
    
    this.reportsService.getNotPaidReasonData(searchCriteria).subscribe(
      data => {
        lstnotpaidReason: new Array();
        this.lstnotpaidReason = data as Array<any>;
        this.isLoading = false;
        //this.recordCount=this.lstCallDetails['length'];
      },
      error => {
        this.isLoading = false;
        alert('Error is :' + error.message);
      }
    );
  }
  exportAsXLSX(){
    if (this.lstnotpaidReason != undefined || this.lstnotpaidReason != null) {
      this.excel.exportAsExcelFile(this.lstnotpaidReason, 'alternate_account,patient_name,dob,not_paid_reson,authorized_by,created_user,date_created', 'Patient Not Paid Reason Report');
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Export To Excel', "Record not found to export.", AlertTypeEnum.WARNING);
      return false;
    }
  }
}