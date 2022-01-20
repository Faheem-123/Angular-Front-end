import { Component, OnInit, Input, Inject, ViewChildren, QueryList } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { LogService } from 'src/app/services/log.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CallingFromEnum } from 'src/app/shared/enum-util';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogParameters } from '../log-parameters';

@Component({
  selector: 'audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  //logTitle='';
  @Input() param: LogParameters;


  logMainTitle: string = "Log";
  logName: string;
  datetimeFrom: string;
  datetimeTo: string;
  datetimeFromFlag: string; // date|datetime
  datetimeToFlag: string;// date|datetime
  userName: string;
  patientId: number;
  PID: string;
  patientName: string;
  enableSearch: boolean = true;
  callingFrom: CallingFromEnum;
  lstOtherCriteria: Array<ORMKeyValue>;




  isLoading: boolean = false;
  lstLog: Array<any>;
  lstHeaders: Array<any>;
  lstLogData: Array<any>;
  lstChildLogs: Array<any>;


  lstChildLogHeaders: Array<any>;
  lstChildLogData: Array<any>;


  searchFormGroup: FormGroup;

  moduleName: string = "";
  selectedQueryId: number = 0;
  logDisplayName: string = "Log";
  childLogDisplayName: string = "";
  isChildLog: boolean = false;

  showLefNavigationSection: boolean = true;


  constructor(config: NgbTimepickerConfig,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private logService: LogService,
    private dateTimeUtil: DateTimeUtil,
    private sortFilterPaginationService: SortFilterPaginationService) {
    config.spinners = false;
    config.size = 'small';
  }

  ngOnInit() {

    debugger;
    if (this.param != undefined) {
      this.logMainTitle = this.param.logMainTitle;
      this.logName = this.param.logName;
      this.logDisplayName = this.param.logDisplayName;
      this.datetimeFrom = this.param.datetimeFrom;
      this.datetimeTo = this.param.datetimeTo;
      this.datetimeFromFlag = this.param.datetimeFromFlag;
      this.datetimeToFlag = this.param.datetimeToFlag;
      this.userName = this.param.userName;
      this.patientId = this.param.patientId;
      this.PID = this.param.PID;
      this.patientName = this.param.patientName;
      this.enableSearch = this.param.enableSearch;
      this.callingFrom = this.param.callingFrom;
      this.lstOtherCriteria = this.param.lstOtherCriteria;
    }

    debugger;
    if (this.enableSearch) {
      this.buildForm();
    }

    if (this.logName == "patient_log" || this.logName == "data_export_log" || this.logName == "ccda_log" || this.logName == "encounter_log") {
      this.getLogList();
    }
    else {
      this.showLefNavigationSection = false;
      this.moduleName = this.logName;
      //this.logTitle = "";
      this.getAuditLog();
    }
  }

  buildForm() {

    this.searchFormGroup = this.formBuilder.group({
      dpDateFrom: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpDateTo: this.formBuilder.control(null, Validators.compose([
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      tpTimeFrom: this.formBuilder.control(null),
      tpTimeTo: this.formBuilder.control(null),
      ddUsers: this.formBuilder.control("all")
    }
    );
  }


  searchLog(formData: any) {

    this.datetimeFrom = "";
    this.datetimeTo = "";
    this.userName = "";

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

    this.getAuditLog();
  }

  getLogList() {

    debugger;
    this.isLoading = true;
    this.lstLog = undefined;
    this.lstHeaders = undefined;
    this.lstLogData = undefined;

    this.logService.getLogList(this.logName).subscribe(
      data => {
        debugger;
        this.lstLog = data as Array<any>;

        if (this.lstLog != undefined && this.lstLog.length > 1) {
          this.showLefNavigationSection = true;
        }
        else {
          this.showLefNavigationSection = false;
        }

        if (this.lstLog != undefined && this.lstLog.length > 0) {
          this.selectedQueryId = this.lstLog[0].query_id;
          this.moduleName = this.lstLog[0].module_name;
          this.logDisplayName = this.lstLog[0].display_name;
          this.getAuditLog();
        }
        else {
          this.isLoading = false;
        }

      },
      error => {
        this.isLoading = false;
        this.getLogListError(error);
      }
    );
  }
  getLogListError(error) {
    this.logMessage.log("getLogList Error.");
  }


  getLogData(log: any) {

    this.selectedQueryId = log.query_id;
    this.moduleName = log.module_name;
    
    this.logDisplayName=log.display_name;
    

    this.getAuditLog();
  }
  getAuditLog() {

    // clear child log 
    this.isChildLog = false;
    this.childLogDisplayName = undefined;
    this.lstChildLogHeaders = undefined;
    this.lstChildLogData = undefined;
    //


    this.isLoading = true;
    this.lstHeaders = undefined;
    this.lstLogData = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;

    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" }
    ];

    if (this.datetimeFrom != undefined && this.datetimeFrom != "") {
      searchCriteria.param_list.push({ name: "datetime_from", value: this.datetimeFrom, option: this.datetimeFromFlag });
    }
    if (this.datetimeTo != undefined && this.datetimeTo != "") {
      searchCriteria.param_list.push({ name: "datetime_to", value: this.datetimeTo, option: this.datetimeToFlag });
    }
    if (this.userName != undefined && this.userName != "" && this.logName != "patient_log") {
      searchCriteria.param_list.push({ name: "user_name", value: this.userName, option: "" });
    }

    if (this.lstOtherCriteria != undefined) {
      this.lstOtherCriteria.forEach(kv => {
        searchCriteria.param_list.push({ name: kv.key, value: kv.value, option: "" });
      });
    }



    this.logService.getAuditLog(this.moduleName, searchCriteria).subscribe(
      data => {
        debugger;
        this.lstHeaders = data["lst_headers"] as Array<any>;
        this.lstLogData = data["lst_log"] as Array<any>;
        this.lstChildLogs = data["lst_child_logs"] as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getAuditLogError(error);
      }
    );
  }
  getAuditLogError(error) {
    this.logMessage.log("getAuditLog Error.");
  }

  clearSearchFeilds() {
    this.searchFormGroup.get("dpDateFrom").setValue(null);
    this.searchFormGroup.get("dpDateTo").setValue(null);
    this.searchFormGroup.get("tpTimeFrom").setValue(null);
    this.searchFormGroup.get("tpTimeTo").setValue(null);
    this.searchFormGroup.get("ddUsers").setValue("all");
  }

  getChildAuditLog(logMain: any, subModuleName: string, title: string) {

    debugger;
    this.isChildLog = true;
    this.childLogDisplayName = title;
    this.isLoading = true;
    this.lstChildLogHeaders = undefined;
    this.lstChildLogData = undefined;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;

    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: "" }
    ];

    if (this.datetimeFrom != undefined && this.datetimeFrom != "") {
      searchCriteria.param_list.push({ name: "datetime_from", value: this.datetimeFrom, option: this.datetimeFromFlag });
    }
    if (this.datetimeTo != undefined && this.datetimeTo != "") {
      searchCriteria.param_list.push({ name: "datetime_to", value: this.datetimeTo, option: this.datetimeToFlag });
    }
    if (this.userName != undefined && this.userName != "") {
      searchCriteria.param_list.push({ name: "user_name", value: this.userName, option: "" });
    }


    let parent_field_name: string = "";
    let parent_field_id: string = "";
    logMain.forEach(col => {

      debugger;
      if (col != "") {

        let regExpFName: RegExp = new RegExp("^parent_field", "i");
        if (regExpFName.test(col)) {
          let ar = col.split("~");

          if (ar.length == 3) {
            parent_field_name = ar[1];
            parent_field_id = ar[2];
          }
        }
      }

    });

    if (parent_field_name != undefined && parent_field_name != "" && parent_field_id != undefined && parent_field_id != "") {
      searchCriteria.param_list.push({ name: parent_field_name, value: parent_field_id, option: "" });
    }



    this.logService.getAuditLog(subModuleName, searchCriteria).subscribe(
      data => {
        debugger;
        this.lstChildLogHeaders = data["lst_headers"] as Array<any>;
        this.lstChildLogData = data["lst_log"] as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getChildAuditLogError(error);
      }
    );
  }
  getChildAuditLogError(error) {
    this.logMessage.log("getChildAuditLog Error.");
  }

  navigateBackFromChildLog() {
    this.isChildLog = false;
    this.childLogDisplayName = undefined;
    this.lstChildLogHeaders = undefined;
    this.lstChildLogData = undefined;
  }


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {

    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstLogData, this.headers, this.sortEvent, null, null,'');
    this.lstLogData = sortFilterPaginationResult.list;
  }


  /*
  //@ViewChildren(NgbdSortableHeader) headersChildLog: QueryList<NgbdSortableHeader>;
  sortEventChildLog: SortEvent;
  onSortChildLog(sortEvent: SortEvent) {
    this.sortEventChildLog = sortEvent;
    this.searchChildLog();
  }
  private searchChildLog() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstChildLogData, this.headers, this.sortEventChildLog, null, null);
    this.lstChildLogData = sortFilterPaginationResult.list;
  }
  */

}
