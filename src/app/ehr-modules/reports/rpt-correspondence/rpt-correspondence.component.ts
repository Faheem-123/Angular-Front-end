import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { DateTimeUtil } from 'src/app/shared/date-time-util';
import { LogMessage } from 'src/app/shared/log-message';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PromptResponseEnum, AlertTypeEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { ReportsService } from 'src/app/services/reports.service';
import { excelService } from 'src/app/shared/excelService';

@Component({
  selector: 'rpt-correspondence',
  templateUrl: './rpt-correspondence.component.html',
  styleUrls: ['./rpt-correspondence.component.css']
})
export class RptCorrespondenceComponent implements OnInit {
  correspondenceReportForm: FormGroup;
  showPatientSearch: boolean = false;
  patientName: string;
  patientId: number;
  isLoading: boolean = false;
  lstCorrespondence: Array<any>;
  recordCount: number = 0;
  
  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private modalService: NgbModal,
  private formBuilder: FormBuilder, private dateTimeUtil: DateTimeUtil,private logMessage: LogMessage,
  private reportsService: ReportsService, private excel: excelService) { }

  ngOnInit(){
    this.buildForm();
  }
  buildForm() {
    this.correspondenceReportForm = this.formBuilder.group({
      dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null)
    })
  }
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
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
    this.correspondenceReportForm.get("txtPatientIdHidden").setValue(null);
  }
}
onPatientSearchBlur() {
  this.logMessage.log("onPatientSearchBlur");
  if (this.patientId == undefined && this.showPatientSearch == false) {
    this.patientName = undefined;
    this.correspondenceReportForm.get("txtPatientSearch").setValue(null);
    this.correspondenceReportForm.get("txtPatientIdHidden").setValue(null);
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
  (this.correspondenceReportForm.get('txtPatientIdHidden') as FormControl).setValue(this.patientId);
  (this.correspondenceReportForm.get('txtPatientSearch') as FormControl).setValue(this.patientName);
  this.showPatientSearch = false;
}
closePatientSearch() {
  this.showPatientSearch = false;
  this.onPatientSearchBlur();
}
  // pateintsearchend


  // dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
  //     dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
  //     txtPatientSearch: this.formBuilder.control(null),
  //     txtPatientIdHidden: this.formBuilder.control(null)
  searchCorrespondenceReport(formData){
    if (formData.dateFrom == undefined || formData.dateFrom == "" || formData.dateTo == undefined || formData.dateTo == ""){
      GeneralOperation.showAlertPopUp(this.modalService, 'Correspondence Report Search', 'Please select any Date.', 'warning');
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
    
    this.reportsService.getCorrespondenceReportData(searchCriteria).subscribe(
      data => {
        lstCorrespondence: new Array();
        this.lstCorrespondence = data as Array<any>;
        this.isLoading = false;
        this.recordCount = this.lstCorrespondence.length;
      },
      error => {
        this.isLoading = false;
        alert('Error is :' + error.message);
      }
    );
  }
  selectedRow=0;
  onSelectionChange(row_no){
    debugger;
    this.selectedRow = row_no;
  }
  exportAsXLSX(){
    debugger;
    if (this.lstCorrespondence != undefined || this.lstCorrespondence != null) {
      this.excel.exportAsExcelFile(this.lstCorrespondence, 'alternate_account,communicate_with,communication,communicationdate,created_user,crdate', 'Correspondence Report');
    }
    else {
      GeneralOperation.showAlertPopUp(this.modalService, 'Export To Excel', "Record not found to export.", AlertTypeEnum.WARNING);
      return false;
    }
  }
}