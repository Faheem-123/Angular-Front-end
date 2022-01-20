import { Component, OnInit, Input, Inject } from '@angular/core';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { ReportsService } from '../../../services/reports.service';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { MainTabsEnum, CallingFromEnum, PromptResponseEnum, PatientSubTabsEnum } from '../../../shared/enum-util';
import { AppointmentToOpen } from '../../../models/common/appointment-to-open';
import { SchedulerLoadedObservable } from '../../../services/observable/scheduler-loaded-observable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogMessage } from '../../../shared/log-message';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { DateTimeUtil, DateTimeFormat } from '../../../shared/date-time-util';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { GeneralOperation } from '../../../shared/generalOperation';
import { FormControl } from '@angular/forms/src/model';
import { PatientToOpen } from '../../../models/common/patientToOpen';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';
import { UniquePipe } from '../../../shared/unique-pipe';
import { SchedulerService } from 'src/app/services/scheduler/scheduler.service';
import { AppointmentOperationData } from '../../scheduler/appointment-operation-data';
import { CallsLogComponent } from '../../scheduler/calls-log/calls-log.component';
import { excelService } from 'src/app/shared/excelService';
import { PhonePipe } from 'src/app/shared/phone-pipe';
import { PagingOptions } from 'src/app/services/sort-filter-pagination.service';
import { Wrapper_ExcelColumn } from 'src/app/models/general/Wrapper_ExcelColumn';
import { ExcelColumn } from 'src/app/models/general/excel-column';

@Component({
  selector: 'rpt-appointments',
  templateUrl: './rpt-appointments.component.html',
  styleUrls: ['./rpt-appointments.component.css']
})
export class RptAppointmentsComponent implements OnInit {

  @Input() lstData: Array<ORMKeyValue>;

  lstLocations: Array<ORMKeyValue>;
  lstLocationProviders: Array<ORMKeyValue>;

  searchForm: FormGroup;

  isLoading: boolean = true;
  preLoadingCount: number = 4;

  headerText: string = "";

  lstAppointments;
  lstFileredProviders;

  patientId;
  patientName;
  providerId = -1;
  locationId = -1;
  statusId = -1;
  typeId = -1;
  sourceId = -1;
  dateFrom;
  dateTo;

  dateFromModel;
  dateToModel;

  appointmentCount: number = 0;
  errorMsg: string = "";

  callingFrom = "";

  showPatientSearch: boolean = false;
  selectedRow:number=0;
  pagingOptions:PagingOptions;
  totalRecords = "0";
  totalPages: number;
  page: number=1;
  pageSize: number=10;
  isExcelExport=false;
  isPrint=false;
  
  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private reportsService: ReportsService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private openModuleService: OpenModuleService,
    private schedulerLoadedObservable: SchedulerLoadedObservable,
    private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private modalService: NgbModal,
    private dateTimeUtil: DateTimeUtil,
    private generalOperation: GeneralOperation,
    private schedulerService: SchedulerService, private excel: excelService
  ) {

    this.lstLocations = this.lookupList.locationList.slice();
  }

  ngOnInit() {
    debugger;
    this.buildForm();
    this.preLoadingCount = 1;
    this.getLocationProviders();

    if (this.lookupList.appStatusList == undefined || this.lookupList.appStatusList.length == 0) {
      this.preLoadingCount++;
      this.getAppStatus();
    }
    if (this.lookupList.appTypesList == undefined || this.lookupList.appTypesList.length == 0) {
      this.preLoadingCount++;
      this.getAppTypes();
    }
    if (this.lookupList.appSourcesList == undefined || this.lookupList.appSourcesList.length == 0) {
      this.preLoadingCount++;
      this.getAppSources();
    }

    debugger;
    if (this.lstData != null && this.lstData != undefined) {
      for (let r of this.lstData) {

        switch (r.key) {
          case "patientId":
            this.patientId = r.value;
            break;
          case "callingFrom":
            this.callingFrom = r.value;
            break;
          case "appointmentDate":
            this.dateFrom = r.value;
            this.dateTo = r.value;
            break;
          case "locationId":
            this.locationId = Number(r.value);
            break;
          case "providerId":
            this.providerId = Number(r.value);
            break;
          case "headerText":
            this.headerText = r.value;
            break;

          default:
            break;
        }

        //console.log(r.key+"="+r.value);
      }
    }


  }

  loadReport() {
debugger;
    if (this.preLoadingCount == 0) {

      if (this.callingFrom === CallingFromEnum.SCHEDULER || this.callingFrom == CallingFromEnum.REPORTS) {
        let dt: Date;
        if (this.dateFrom == null || this.dateFrom == undefined) {
          dt = this.dateTimeUtil.getDateTimeFromString(this.dateTimeUtil.getCurrentDateTimeString(), DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);
        }
        else
          dt = this.dateTimeUtil.getDateTimeFromString(this.dateFrom, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

        this.dateFromModel = { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
        this.dateToModel = { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };

        this.filterProviders();
      }


      if (this.callingFrom == CallingFromEnum.SCHEDULER || this.callingFrom == CallingFromEnum.PATIENT)
        this.getAppointments(this.searchForm);
      else
        this.isLoading = false;

    }
  }

  buildForm() {

    debugger;
    this.searchForm = this.formBuilder.group({
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(this.patientId),
      cmbProvider: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider==0?'-1':this.lookupList.logedInUser.defaultProvider),
      cmbLocation: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation==0?'-1':this.lookupList.logedInUser.defaultLocation),
      cmbStatus: this.formBuilder.control(this.statusId),
      dpDateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),
      dpDateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.required),

      // dpDateFrom: this.formBuilder.control(this.dateFromModel),
      // dpDateTo: this.formBuilder.control(this.dateToModel),
      cmbType: this.formBuilder.control(this.typeId),
      cmbSource: this.formBuilder.control(this.sourceId)
    });


  }

  getLocationProviders() {
    this.lstLocationProviders = undefined;
    this.schedulerService.getLocationProviders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstLocationProviders = data as Array<any>;
        //this.lstFileredProviders = new ListFilterPipe().transform(this.lstProviders, "location_id", this.locationId);
        //this.filterProviders();
        this.preLoadingCount--;
        this.loadReport();
      },
      error => {
        this.ongetLocationProvidersError(error);
      }
    );
  }

  ongetLocationProvidersError(error) {
    this.logMessage.log("getLocationProviders Error.");
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
      this.searchForm.get("txtPatientIdHidden").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      //this.patientName = undefined;
      this.searchForm.get("txtPatientSearch").setValue(null);
      this.searchForm.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }

  openSelectPatient(patObject) {

    debugger;
    this.logMessage.log(patObject);

    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      //this.show = false;
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;

      let closeResult;

      modalRef.result.then((result) => {
        //this.show = true;

        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //this.show = true;
          //alert(reason);
        });

      return;
    }

    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;

    this.searchForm.get("txtPatientIdHidden").setValue(this.patientId);
    this.searchForm.get("txtPatientSearch").setValue(this.patientName);
    this.showPatientSearch = false;
  }

  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  onSearch(formData) {
    debugger;
    this.isPrint=false;
    this.isExcelExport=false;
    this.providerId = formData.cmbProvider;
    this.locationId = formData.cmbLocation;
    this.typeId = formData.cmbType;
    this.sourceId = formData.cmbSource;
    this.statusId = formData.cmbStatus;

    this.dateFrom = String("00" + formData.dpDateFrom.month).slice(-2) + '/' + String("00" + formData.dpDateFrom.day).slice(-2) + '/' + String("0000" + formData.dpDateFrom.year).slice(-4);
    this.dateTo = String("00" + formData.dpDateTo.month).slice(-2) + '/' + String("00" + formData.dpDateTo.day).slice(-2) + '/' + String("0000" + formData.dpDateTo.year).slice(-4);

    
    this.getAppointments(formData);
  }
  searchCriteria: SearchCriteria;
  getAppointments(formData) {
debugger;
   
    debugger;
    this.isLoading = true;
    if(this.isExcelExport==false && this.isPrint==false)
    {
      this.lstAppointments = undefined;
      this.appointmentCount = 0;
    }
    this.searchCriteria= new SearchCriteria();
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.param_list = [];
    if (this.callingFrom === CallingFromEnum.SCHEDULER || this.callingFrom == CallingFromEnum.REPORTS) {

      if (this.patientId != undefined && this.patientId > 0) {
        this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
      }
      if (this.providerId != undefined && this.providerId > 0) {
        this.searchCriteria.param_list.push({ name: "provider_id", value: this.providerId, option: "" });
      }
      if (this.locationId != undefined && this.locationId > 0) {
        this.searchCriteria.param_list.push({ name: "location_id", value: this.locationId, option: "" });
      }
      if (this.typeId != undefined && this.typeId > 0) {
        this.searchCriteria.param_list.push({ name: "type_id", value: this.typeId, option: "" });
      }
      if (this.sourceId != undefined && this.sourceId > 0) {
        this.searchCriteria.param_list.push({ name: "source_id", value: this.sourceId, option: "" });
      }
      if (this.statusId != undefined && this.statusId > 0) {
        this.searchCriteria.param_list.push({ name: "status_id", value: this.statusId, option: "" });
      }
      if (this.dateFrom != undefined) {
        this.searchCriteria.param_list.push({ name: "date_from", value: this.dateFrom, option: "" });
      }
      if (this.dateTo != undefined) {
        this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTo, option: "" });
      }
    }
    else if (this.callingFrom === CallingFromEnum.PATIENT || this.callingFrom === CallingFromEnum.SCHEDULER_PATIENT_APPOINTMENT_REPORT) {
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientId, option: "" });
    }
    this.searchCriteria.param_list.push( { name: "pageIndex", value: this.isExcelExport?"0":this.isPrint ?"0":this.page, option: "" });
    this.searchCriteria.param_list.push( { name: "pageSize", value: this.isExcelExport?"0":this.isPrint ?"0":this.pageSize, option: "" });
    if(this.isExcelExport)
    {
      let lstColumns: Array<any> = new Array<any>();
      lstColumns = [
        new ExcelColumn('patient_name', 'Patient'),
        new ExcelColumn('gender', 'Gender'),
        new ExcelColumn('dob', 'DOB'),
        new ExcelColumn('cell_phone', 'Cell Phone'),
        new ExcelColumn('home_phone', 'Home Phone'),
        new ExcelColumn('appointment_date', 'App. Date'),

        new ExcelColumn('appointment_time', 'App. Time'),
        new ExcelColumn('status', 'App. Status'),
        new ExcelColumn('source', 'App. Source'),

        new ExcelColumn('app_type', 'App. Type'),
        new ExcelColumn('provider_name', 'Provider'),
        new ExcelColumn('location_name', 'Location'),

        new ExcelColumn('insurance_name', 'Insurance'),
        new ExcelColumn('copay', 'Copay'),
      ];
      let wrapper:Wrapper_ExcelColumn=new Wrapper_ExcelColumn();
      wrapper.lst_excel_columns= lstColumns;
      this.searchCriteria.param_list.push( { name: "excelColumn", value: JSON.stringify(wrapper), option: "" });
    }
    if(this.isExcelExport)
    {
      this.searchCriteria.option="getAppointments";
      this.callExportReport(this.searchCriteria);
    }
    else{
    this.reportsService.getAppointments(this.searchCriteria).subscribe(
      data => {
        debugger;
        if(this.isPrint)
        {
          this.print(data);
          this.isPrint=false;
           this.isLoading = false;
          return;
        }
        this.lstAppointments = data;
        if(this.lstAppointments!=null && this.lstAppointments.length>0)
        {        
          this.totalPages=this.lstAppointments[0].total_count;
          this.totalRecords = this.totalPages.toString();
        }
        else{
          this.totalRecords="0"
          this.totalPages=0;
        }
        //this.appointmentCount = this.lstAppointments.length;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.totalRecords="0";
        this.totalPages=0;
        this.getAppointmentsError(error);
        return;
      }
    );
    }
  }
  callExportReport(searchCriteria:SearchCriteria){
    let downloadPath="";
    this.reportsService.getExportResult(searchCriteria).subscribe(
      data => {
        debugger;
        if (data['result']!='') {
          //download
          //this.downloafile(data, ".xlsx", "rptClaim_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
          this.generalOperation.downloaExcelFile(data, ".xlsx", "rptClaim_"+this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_S));
          this.isLoading = false;
          this.isExcelExport=false;
        }
        else{
          //error
          debugger;
        }
      },
      error => {
        debugger;
      }
    );
  }
  locationChanged() {
    this.locationId = this.searchForm.get("cmbLocation").value;
    this.filterProviders();
  }

  filterProviders() {

    debugger;
    if (this.lstLocationProviders == undefined)
      return;

    if (this.locationId > 0) {
      //let listFilterPipe: ListFilterPipe;
      this.lstFileredProviders = new ListFilterPipe().transform(this.lstLocationProviders, "location_id", this.locationId);
    }
    else {
      //let uniquePipe:UniquePipe;
      this.lstFileredProviders = new UniquePipe().transform(this.lstLocationProviders, "provider_id");
    }

    let index: number = this.generalOperation.getitemIndex(this.lstFileredProviders, "provider_id", this.providerId);
    if (index == undefined) {
      this.providerId = this.lstFileredProviders[0].provider_id;
    }

    if (this.providerId == undefined) {
      (this.searchForm.get("cmbProvider") as FormControl).setValue(-1);
    }
    else {
      (this.searchForm.get("cmbProvider") as FormControl).setValue(this.providerId);
    }
  }



  getAppointmentsError(error) {
    this.errorMsg = error;
  }

  openScheduler(objApointment) {
    this.openModuleService.navigateToTab.emit(MainTabsEnum.SCHEDULER);
    let appointmentToOpen: AppointmentToOpen = new AppointmentToOpen();
    appointmentToOpen.patientId = objApointment.patient_id;
    appointmentToOpen.appointmentId = objApointment.appointment_id;
    appointmentToOpen.patientName = objApointment.patient_name;
    appointmentToOpen.appointmentDate = objApointment.appointment_date;
    appointmentToOpen.locationId = objApointment.location_id;
    appointmentToOpen.providerId = objApointment.provider_id;
    appointmentToOpen.appointmentTime = objApointment.appointment_time;

    if (this.schedulerLoadedObservable.isSchedulerLoaded) {
      this.openModuleService.openSchedulerAppointment.emit(appointmentToOpen);
    }
    else {
      this.schedulerLoadedObservable.isSchedulerLoadedChange.subscribe(
        value => {
          if (value) {
            this.openModuleService.openSchedulerAppointment.emit(appointmentToOpen);
            //this.schedulerLoadedObservable.isSchedulerLoadedChange.unsubscribe();
          }
        }
      );
    }

  }

  openPatient(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    if (this.callingFrom == 'reports')
      obj.child_module = PatientSubTabsEnum.APPOINTMENTS;
    this.openModuleService.openPatient.emit(obj);
  }


  getAppStatus() {
    this.schedulerService.getAppStatus(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.appStatusList = data as Array<any>;
        this.preLoadingCount--;
        this.loadReport();
      },
      error => {
        this.getAppStatusError(error);
        this.isLoading = false;
      }
    );
  }
  getAppStatusError(error) {
    this.logMessage.log("getAppStatus Error.");
  }

  getAppTypes() {
    this.schedulerService.getAppTypes(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.appTypesList = data as Array<any>;
        this.preLoadingCount--;
        this.loadReport();
      },
      error => {
        this.getAppTypesError(error);
        this.isLoading = false;
      }
    );
  }
  getAppTypesError(error) {
    this.logMessage.log("getAppTypes Error.");
  }

  getAppSources() {
    this.schedulerService.getAppSources(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.appSourcesList = data as Array<any>;
        this.preLoadingCount--;
        this.loadReport();
      },
      error => {
        this.getAppSourcesError(error);
        this.isLoading = false;
      }
    );
  }
  getAppSourcesError(error) {
    this.logMessage.log("getAppSources Error.");
  }

  showCallLog(app) {

    let appData: AppointmentOperationData = new AppointmentOperationData();
    appData.appointmentId = app.appointment_id;
    appData.patientName = app.patient_name;
    appData.appDuration = app.appointment_duration;
    appData.patientId = app.patient_id;
    appData.appDate = app.appointment_date;
    appData.appTime = app.appointment_time;
    appData.appStatusId = app.status_id;
    //appData.dob = this.appointment.dob;
    appData.phone = app.cell_number;
    appData.comments = app.appointment_comments;


    const modalRef = this.modalService.open(CallsLogComponent, this.xLgPoupUpOptions);
    modalRef.componentInstance.appOperationData = appData;

    modalRef.result.then((result) => {

      debugger;
      if (result == true) {
        // this.loadScheduler("inside");
      }
    }
      , (reason) => {

        //alert(reason);
      });
  }
  xLgPoupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };
  exportAsXLSX() {
    debugger;
    this.isExcelExport=true;
    this.getAppointments(this.searchForm);
    //this.excel.exportAsExcelFile(this.lstAppointments, 'pid,patient_id,patient_name,dob,gender,cell_phone,home_phone,appointment_date,appointment_time,appointment_duration,status,provider_name,location_name,insurance_name,source,app_type,appointment_comments', 'Appointment');
  }
  onPrintClick(){
    this.isPrint=true;
    this.getAppointments(this.searchForm.value);
  }
  print(lstAppointments) {
    debugger;
    let strHtml: string = "";
    let strHeaderDate: string = "";
    let strPhone: string = "";
    let location_name = "All Locations";
    let provider_name = "All Providers";
    let index;
if(this.callingFrom != CallingFromEnum.PATIENT)
{
    if (this.searchForm.get("cmbProvider").value == "-1") {
      provider_name = "All Providers";
    }
    else {
      index = this.generalOperation.getitemIndex(this.lstFileredProviders, "provider_id", this.searchForm.get("cmbProvider").value);
      provider_name = this.lstFileredProviders[index].provider_name;
    }

    if (this.searchForm.get("cmbLocation").value == "-1") {
      location_name = "All Locations";
    }
    else {
      index = this.generalOperation.getitemIndex(this.lstLocations, "id", this.searchForm.get("cmbLocation").value);
      location_name = this.lookupList.locationList[index].name;
    }


    if (this.dateFrom != undefined && this.dateFrom != null) {
      if (this.dateFrom == this.dateTo) {
        strHeaderDate = this.dateFrom;
      }
      else {
        strHeaderDate = " (" + this.dateFrom + " to " + this.dateTo + ")";
      }
    }
  }
    else {
      strHeaderDate = "Patient Appointment(s)";
    }
    strHtml += "<html>" +
      "<head>" +
      "<title>Appointment Report</title>" +
      "<style>" +
      ".styleTopHeader {	font-family: Calibri;	font-weight: bold;	font-size: 18px; color:#0376a8;}" +
      ".styleTopSubHeader {	font-family: Calibri;	font-weight: bold;	font-size: 13px; color:#0376a8;}" +
      "#customers{font-size:11px;font-family:Trebuchet MS, Arial, Helvetica, sans-serif;border-collapse:collapse;}" +
      "#customers td, #customers th {border:1px solid #0376a8;padding:3px 7px 2px 7px;}" +
      "#customers th {font-size:1.4em;text-align:left;padding-top:5px;padding-bottom:4px;background-color:#A7C942;color:#fff;}" +
      "#el08 {	width:1.2em;	height:1.2em;} " +
      "</style>" +
      "</head>" +
      "<body>" +
      "<table width='750' border='0' cellpadding='0' cellspacing='0'>" +
      "<tr>" +
      "	<td colspan='2' width='100%' align='center' valign='top'><span class='styleTopHeader'>" + this.lookupList.practiceInfo.practiceName + "</span></td>" +
      "  </tr>" +
      "  <tr>" +
      "	<td colspan='2' align='right' valign='top'><span class='styleTopSubHeader'>" + strHeaderDate + "</span></td>" +
      "  </tr>" +
      "  </table>" +
      "<table width='750' border='0' cellpadding='0' cellspacing='0' id='customers'>" +
      "<tbody>" +
      "	<td align='center' colspan='6' style='background-color: #0376a8; color:#ffffff; font-weight:bold;font-size:16px'>Scheduled For " + provider_name + " At " + location_name + " (" + lstAppointments.length + ")</td>" +
      " </tbody>" +
      "</table>" +
      "<table id='customers' width='750' border='0' cellpadding='0' cellspacing='0'>" +
      "<tr style='background-color: #cee6f8; color:#000000; font-weight:bold;'>" +
      "<td width='68'>Date</td>" +
      "<td width='45'>Time</td>" +
      "<td>Name</td>" +
      "<td>DOB</td>" +
      "<td>Visit Type</td>" +
      "<td>Duration</td>" +
      "<td width='80'>Phone</td>" +
      "<td>Comment</td>" +
      "</tr>" +
      "<tbody>";
    for (let i = 0; i < lstAppointments.length; i++) {
      if (lstAppointments[i].cell_phone != null && lstAppointments[i].cell_phone != "") {
        strPhone = new PhonePipe().transform(lstAppointments[i].cell_phone);
      }
      else if (lstAppointments[i].home_phone != null && lstAppointments[i].home_phone != "") {
        strPhone = new PhonePipe().transform(lstAppointments[i].home_phone);
      }
      else
        strPhone = "";

      strHtml += "<tr>";
      strHtml += "<td>" + lstAppointments[i].appointment_date + "</td>";
      strHtml += "<td>" + lstAppointments[i].appointment_time + "</td>";
      strHtml += "<td>" + lstAppointments[i].patient_name + "</td>";
      strHtml += "<td>" + lstAppointments[i].dob + "</td>";
      strHtml += "<td>" + lstAppointments[i].app_type + "</td>";
      strHtml += "<td>" + lstAppointments[i].appointment_duration + "</td>";
      strHtml += "<td>" + strPhone + "</td>";
      strHtml += "<td>" + lstAppointments[i].appointment_comments + "</td>";
      strHtml += "</tr>";
    }
    strHtml += "</tbody>";
    strHtml += "</table>";
    strHtml += "</body>";
    strHtml += "</html>";

    let disp_setting = "toolbar=yes,location=no,directories=yes,menubar=yes,";
    disp_setting += "scrollbars=yes,width=790,  left=100, top=25";
    var w = window.open("", "", disp_setting);
    w.document.open();
    w.document.write(strHtml);
    w.document.close();
    w.focus();
  }

  onRowSelection(row:number){
    this.selectedRow=row;
  }
  pageOptionChaged() {
    //this.onCallPagingChange();
    this.onSearch(this.searchForm.value);
  } 
  pageChange(event){   
    debugger; 
    this.page=event;
    this.pagingOptions=new PagingOptions(this.page,this.pageSize)
    this.onSearch(this.searchForm.value);
    //this.search();
  }

}
