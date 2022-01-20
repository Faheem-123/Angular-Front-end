import { Component, OnInit, Inject, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
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
import { AlertTypeEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { NgbdSortableHeader, SortEvent, SortFilterPaginationResult, SortFilterPaginationService } from 'src/app/services/sort-filter-pagination.service';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { LogParameters } from '../log-parameters';


@Component({
  selector: 'encounter-access-log',
  templateUrl: './encounter-access-log.component.html',
  styleUrls: ['./encounter-access-log.component.css']
})
export class EncounterAccessLogComponent implements OnInit {

  @Input() param: LogParameters;
  //@Output() navigateBack = new EventEmitter<any>();
  @Output() showLogEvent = new EventEmitter<any>();

  isLoading: boolean = false;
  //showAccessLog: boolean = true;
  //showEncounterLog: boolean = false;


  lstEncounterAccessLog: Array<any>;
  searchFormGroup: FormGroup;

  selectedRowId: number = 0;
  logName: string = "";

  lstOtherCriteria: Array<ORMKeyValue>;

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

    if (this.param != undefined) {
      this.logName = this.param.logName;
      //this.logDisplayName = this.param.logDisplayName;
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

    this.getPatientAccessLog();
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





  getPatientAccessLog() {

    this.isLoading = true;
    this.lstEncounterAccessLog = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [];



    if (this.patientId != undefined) {
      searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
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

    /*if (this.isEmergencyAccessed != undefined && this.isEmergencyAccessed == "1") {
      searchCriteria.param_list.push({ name: "is_emergency_accessed", value: this.isEmergencyAccessed, option: "" });
    }
    */


    this.logService.getEncounterAccessLog(searchCriteria).subscribe(
      data => {
        this.lstEncounterAccessLog = data as Array<any>;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.getEncounterLogError(error);
      }
    );
  }
  getEncounterLogError(error) {
    this.logMessage.log("getEncounterLogError Error.");
  }

  accessLogRowSelectionChanged(rowId: number) {

    this.selectedRowId = rowId;
  }



  clearSearchFeilds() {
    this.searchFormGroup.get("dpDateFrom").setValue(null);
    this.searchFormGroup.get("dpDateTo").setValue(null);
    this.searchFormGroup.get("tpTimeFrom").setValue(null);
    this.searchFormGroup.get("tpTimeTo").setValue(null);
    this.searchFormGroup.get("ddUsers").setValue("all");
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {

    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.lstEncounterAccessLog, this.headers, this.sortEvent, null, null,'');
    this.lstEncounterAccessLog = sortFilterPaginationResult.list;
  }


  navigateToEncounterLog(encounter: any) {

    let othCriteria = new Array<ORMKeyValue>();
    othCriteria.push(new ORMKeyValue("chart_id", encounter.chart_id));


    let logParameters: LogParameters = new LogParameters();
    logParameters.logMainTitle = "Encounter Log";
    logParameters.logName = "encounter_log";
    logParameters.logDisplayName = "Encounter Log";
    logParameters.patientId = this.patientId;
    logParameters.PID = this.PID;
    logParameters.patientName = this.patientName;
    logParameters.userName = this.userName;
    logParameters.datetimeFrom = this.datetimeFrom;
    logParameters.datetimeTo = this.datetimeTo;
    logParameters.datetimeFromFlag = this.datetimeFromFlag;
    logParameters.datetimeToFlag = this.datetimeToFlag;
    logParameters.enableSearch = false;
    logParameters.lstOtherCriteria = othCriteria;

    this.showLogEvent.emit(logParameters);

    debugger;

    //this.logName = "encounter_log";



    //this.showAccessLog = false;
    //this.showEncounterLog = true;
  }

  //navigateBackToAccessLog() {
  //this.showEncounterLog = false;
  //this.showAccessLog = true;
  //}
}
