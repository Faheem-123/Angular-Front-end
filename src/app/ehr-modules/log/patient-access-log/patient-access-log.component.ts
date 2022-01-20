import { Component, OnInit, Inject, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { GeneralService } from 'src/app/services/general/general.service';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbTimepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LogService } from 'src/app/services/log.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum } from 'src/app/shared/enum-util';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { LogParameters } from '../log-parameters';

@Component({
  selector: 'patient-access-log',
  templateUrl: './patient-access-log.component.html',
  styleUrls: ['./patient-access-log.component.css']
})
export class PatientAccessLogComponent implements OnInit {


  @Output() showLogEvent = new EventEmitter<any>();



  searchFormGroup: FormGroup;
  lstPatAccessLog: Array<any>;
  isLoading: boolean = false;
  showPatientSearch: boolean = false;


  datetimeFromFlag: string = "datetime";
  datetimeToFlag: string = "datetime";
  datetimeFrom: string = "";
  datetimeTo: string = "";
  patientIdSearched: string = "";
  userName: string = "";
  isEmergencyAccessed: string = "";

  selectedRowId: number = 0;

  showAccessLog: boolean = true;
  //showPatientLog: boolean = false;
  //showEncounterAccessLog: boolean = false;

  selectedPatientName: string = "";
  selectedPID: string = "";
  selectedPatientId: number;
  //auditLogSearchCriteria: SearchCriteria;
  //dateRange:string="";  

  logName: string = "";
  //sectionAuditLogHeading:string=""


  constructor(config: NgbTimepickerConfig,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private generalService: GeneralService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private logService: LogService,
    private ngbModal: NgbModal,
    private sortFilterPaginationService: SortFilterPaginationService) {

    config.spinners = false;
    config.size = 'small';

  }

  ngOnInit() {



    if (this.lookupList.practiceUsersList == undefined || this.lookupList.practiceUsersList.length == 0) {
      this.getPracticeUsersList();
    }

    this.buildForm();
  }

  buildForm() {

    this.searchFormGroup = this.formBuilder.group({
      dpDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      tpTimeFrom: this.formBuilder.control(null),
      tpTimeTo: this.formBuilder.control(null),
      ddUsers: this.formBuilder.control("all"),
      txtPatientSearch: this.formBuilder.control(null),
      chkEmergencyAccess: this.formBuilder.control(null)
    }
    );
  }

  getPracticeUsersList() {
    this.generalService.getPracticeUsersList(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.practiceUsersList = data as Array<any>;
      },
      error => {
        this.getPracticeUsersListError(error);
      }
    );
  }
  getPracticeUsersListError(error) {
    this.logMessage.log("getPracticeUsersList Error." + error);
  }


  searchLog(formData: any) {


    this.datetimeFrom = "";
    this.datetimeTo = "";
    this.userName = "";
    this.isEmergencyAccessed = "";

    if (formData.dpDateFrom != undefined) {

      let timeFrom: string = "";
      if (formData.tpTimeFrom != undefined && formData.tpTimeFrom.hour != undefined && formData.tpTimeFrom.minute != undefined) {
        timeFrom = this.dateTimeUtil.getStringTimeFromTimeModel(formData.tpTimeFrom);
      }

      if (timeFrom == "") {
        this.datetimeFromFlag = "date";
        //timeFrom = "00:00";
        this.searchFormGroup.get("tpTimeFrom").setValue(null);
        this.datetimeFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateFrom);
      }
      else {
        this.datetimeFromFlag = "datetime";
        this.datetimeFrom = this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateFrom) + " " + timeFrom;
      }

    }
    if (formData.dpDateTo != undefined) {

      let timeTo: string = "";
      if (formData.tpTimeTo != undefined && formData.tpTimeTo.hour != undefined && formData.tpTimeTo.minute != undefined) {
        timeTo = this.dateTimeUtil.getStringTimeFromTimeModel(formData.tpTimeTo);
      }

      if (timeTo == "") {
        //timeTo = "23:59";
        this.datetimeToFlag = "date";
        this.searchFormGroup.get("tpTimeTo").setValue(null);
        this.datetimeTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateTo);
      }
      else {
        this.datetimeToFlag = "datetime";
        this.datetimeTo = this.dateTimeUtil.getStringDateFromDateModel(formData.dpDateTo) + " " + timeTo;
      }


    }

    if (formData.ddUsers != undefined && formData.ddUsers != 'all') {
      this.userName = formData.ddUsers;
    }

    if (formData.chkEmergencyAccess == true) {
      this.isEmergencyAccessed = "1"
    }


    if (this.datetimeFrom == "" || this.datetimeTo == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Patient Access Log', "Date From and Date To is required.", AlertTypeEnum.DANGER)
    }
    else {
      this.getPatientAccessLog();
    }
  }

  getPatientAccessLog() {

    this.isLoading = true;
    this.lstPatAccessLog = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];
    /*
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientIdSearched, option: "" },
      { name: "datetime_from", value: this.datetimeFrom, option: "" },
      { name: "datetime_to", value: this.datetimeTo, option: "" },
      { name: "user_name", value: this.userName, option: "" },
      { name: "is_emergency_accessed", value: this.isEmergencyAccessed, option: "" }
    ];
    */


    if (this.patientIdSearched != undefined && this.patientIdSearched != "") {
      searchCriteria.param_list.push({ name: "patient_id", value: this.patientIdSearched, option: "" });
    }
    if (this.datetimeFrom != undefined && this.datetimeFrom != "") {
      searchCriteria.param_list.push({ name: "datetime_from", value: this.datetimeFrom, option: this.datetimeFromFlag });
    }
    if (this.datetimeTo != undefined && this.datetimeTo != "") {
      searchCriteria.param_list.push({ name: "datetime_to", value: this.datetimeTo, option: this.datetimeToFlag });
    }
    if (this.userName != undefined && this.userName != "") {
      searchCriteria.param_list.push({ name: "user_name", value: this.userName, option: "" });
    }
    if (this.isEmergencyAccessed != undefined && this.isEmergencyAccessed == "1") {
      searchCriteria.param_list.push({ name: "is_emergency_accessed", value: this.isEmergencyAccessed, option: "" });
    }


    this.logService.getPatientAccessLog(searchCriteria).subscribe(
      data => {
        this.lstPatAccessLog = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getPatientAccessLogError(error);
      }
    );
  }
  getPatientAccessLogError(error) {
    this.logMessage.log("getPatientAccessLog Error.");
  }

  accessLogRowSelectionChanged(rowId: number) {


    this.selectedRowId = rowId;
  }


  onPatientSearchKeydown(event: any) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(value) {
    this.patientIdSearched = "";
  }
  onPatientSearchBlur() {
    if (this.patientIdSearched == undefined || this.patientIdSearched == "") {
      this.searchFormGroup.get("txtPatientSearch").setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject: any) {

    this.patientIdSearched = patObject.patient_id;
    (this.searchFormGroup.get('txtPatientSearch') as FormControl).setValue(patObject.name);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {


    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstPatAccessLog, this.headers, this.sortEvent, null, null,'');
    this.lstPatAccessLog = sortFilterPaginationResult.list;
  }


  onLogMenuClick(option: string, data: any) {

    debugger;
    this.selectedPatientId = undefined;
    this.selectedPatientName = "";
    this.selectedPID = "";
    //this.showAccessLog = false;
    //this.showPatientLog = false;

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = option;
    logParameters.patientId = data.patient_id;
    logParameters.PID = data.alternate_account;
    logParameters.patientName = data.last_name + ', ' + data.first_name;
    logParameters.userName = this.userName;
    logParameters.datetimeFrom = this.datetimeFrom;
    logParameters.datetimeTo = this.datetimeTo;
    logParameters.datetimeFromFlag = this.datetimeFromFlag;
    logParameters.datetimeToFlag = this.datetimeToFlag;
    logParameters.enableSearch = false;

    switch (option) {
      case "patient_log":
        logParameters.logMainTitle = "Patient Log";
        logParameters.logDisplayName = "Patient Log";
        break;
      case "encounter_access_log":
        logParameters.logMainTitle = "Encounter Access Log";
        logParameters.logDisplayName = "Encounter Access Log";
        break;
      case "data_export_log":
        logParameters.logMainTitle = "Data Export Log";
        logParameters.logDisplayName = "Data Export Log";
        break;
      case "ccda_log":
        logParameters.logMainTitle = "CCDA Log";
        logParameters.logDisplayName = "CCDA Log";
        break;
    }

    this.showLogEvent.emit(logParameters);
  }

  navigateBackToAccessLog() {
    this.showAccessLog = true;
    //this.showPatientLog = false;
    //this.showEncounterAccessLog = false;
  }
}
