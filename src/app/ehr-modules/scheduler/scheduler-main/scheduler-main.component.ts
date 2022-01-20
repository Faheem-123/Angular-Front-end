import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { NgbDateStruct, NgbDatepickerConfig, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { LogMessage } from '../../../shared/log-message';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { DateTimeUtil, DatePart, DateTimeFormat } from '../../../shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { AppointmentPopupComponent } from '../appointment-popup/appointment-popup.component';
import { AppointmentOperationData, AppointmentOptions } from '../appointment-operation-data';
import { GeneralOperation } from '../../../shared/generalOperation';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from '../../../models/general/orm-delete-record';
import { ServiceResponseStatusEnum, PromptResponseEnum, CallingFromEnum, AlertTypeEnum, PatientSubTabsEnum, OperationType, SchedulerViewType } from '../../../shared/enum-util';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { CheckInOutPopupComponent } from '../check-in-out-popup/check-in-out-popup.component';
import { OpenModuleService } from '../../../services/general/openModule.service';
import { AppointmentToOpen } from '../../../models/common/appointment-to-open';
import { SchedulerLoadedObservable } from '../../../services/observable/scheduler-loaded-observable';
import { FormControl } from '@angular/forms/src/model';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { PatientEligibilityComponent } from '../../patient/patient-eligibility/patient-eligibility.component';
import { CashRegisterComponent } from '../../../billing-modules/payment/cash-register/cash-register.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { PrintDemographicsComponent } from '../../patient/patient-info/print-demographics/print-demographics.component';
import { ORMPatientChart } from 'src/app/models/encounter/ORMPatientChart';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { EncounterSnapshotComponent } from '../../encounter/encounter-snapshot/encounter-snapshot.component';
import { PatientNotesComponent } from '../../patient/patient-notes/patient-notes.component';
import { CallsLogComponent } from '../calls-log/calls-log.component';
import { LogParameters } from '../../log/log-parameters';
import { LogPopUpComponent } from '../../log/log-pop-up/log-pop-up.component';
import { DateModel } from 'src/app/models/general/date-model';

const now = new Date();

@Component({
  selector: 'scheduler-main',
  templateUrl: './scheduler-main.component.html',
  styleUrls: ['./scheduler-main.component.css']
})
export class SchedulerMainComponent implements OnInit {

  public schedulerForm: FormGroup;
  dateModel: NgbDateStruct;
  @ViewChild('datePicker') datePicker;

  isLoading: boolean = true;
  preLoadingCount: number = 4;

  lstLocations: Array<any>;
  lstLocationProviders: Array<any>;
  lstFileredProviders: Array<any>;

  lstAppointments: Array<any>;
  lstSchedulerTiming: Array<any>;
  lstTimingInfo: Array<ORMKeyValue>;
  lstProviderTiming: Array<any>;
  lstProviderTempTiming: Array<any>;
  timingToApply: any;

  providerId: number;
  locationId: number;
  selectedDate: string;
  selectedDateDisplay: string;
  selectedTime: string;

  slot_size: number;
  time_start: string;
  time_end: string;
  break_enabled: boolean;
  break_start: string;
  break_end: string;

  isTempTimingApplied: boolean = false;
  isDayOff: boolean = false;
  isTimingNotAvailable: boolean = false;
  totalColoums: number = 1;
  // appointmentCount: number = 0;

  appointmentCountNormalView: number = 0;
  appointmentCountLocationView: number = 0;
  appointmentCountProviderView: number = 0;
  appointmentCountMonthView: number = 0;


  isChangeEveApplicable: boolean = true;
  isSchedulerModuleLoaded: boolean = false;
  highlightSlotTime;
  patientIdSelected: number;
  patientIdSearched: number;
  patientNameSearched: string;
  patientAddEditOperation;

  lstAppiontmentReportData: Array<ORMKeyValue>;
  showScheduler: boolean = true;
  showSchedulerReport: boolean = false;
  showSchedulerSettings: boolean = false;
  addEditPatientFlag: boolean = false;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  xLgPoupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };


  constructor(private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private schedulerService: SchedulerService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private ngbModal: NgbModal,
    private generalOperation: GeneralOperation,
    private openModuleService: OpenModuleService,
    private schedulerLoadedObservable: SchedulerLoadedObservable,
    private encounterService: EncounterService,
    config: NgbDatepickerConfig) {

    //config.outsideDays = 'hidden';

    this.lstAppiontmentReportData = new Array();
    this.lstAppiontmentReportData.push(new ORMKeyValue('callingFrom', CallingFromEnum.SCHEDULER))


    //Catch the event to make the search    
    this.openModuleService.openSchedulerAppointment.subscribe(value => {
      //console.log("Open Patient:"+value);
      //this.showSchedulerReport = false;
      this.navigateBackToScheduler();
      this.openSchedulerAppintment(value);
    });

    debugger;
    //this.lstProviders = this.lookupList.providerList.slice();
    this.lstLocations = this.lookupList.locationList.slice();
    this.locationId = Number(this.lookupList.logedInUser.defaultLocation);
    let index: number = this.generalOperation.getitemIndex(this.lstLocations, "id", this.locationId);
    if (index == undefined) {
      this.locationId = Number(this.lstLocations[0].id);
    }



    this.providerId = Number(this.lookupList.logedInUser.defaultProvider);
    this.dateModel = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    //this.selectedDate =now.getMonth()+1 + '/' + now.getDate() + '/' + now.getFullYear();
    this.selectedDate = String("00" + (now.getMonth() + 1)).slice(-2) + '/' + String("00" + now.getDate()).slice(-2) + '/' + String("0000" + now.getFullYear()).slice(-4);
    this.selectedDateDisplay = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_DDDD_MMM_DD_YYYY);

    this.preLoadingCount = 5;
    this.isLoading = true;
    this.getLocationProviders();
    this.getAppStatus();
    this.getAppTypes();
    this.getAppSources();
    this.getAppReasons();
  }

  openSchedulerAppintment(appointmentToOpen: AppointmentToOpen) {

    //console.log(appointmentToOpen);
    debugger;
    this.patientNameSearched = undefined;
    this.isChangeEveApplicable = false;
    this.highlightSlotTime = appointmentToOpen.appointmentTime;
    this.patientIdSearched = appointmentToOpen.patientId;

    let dt = this.dateTimeUtil.getDateTimeFromString(appointmentToOpen.appointmentDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    this.dateModel = { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
    this.selectedDate = String("00" + (dt.getMonth() + 1)).slice(-2) + '/' + String("00" + dt.getDate()).slice(-2) + '/' + String("0000" + dt.getFullYear()).slice(-4);
    this.selectedDateDisplay = this.dateTimeUtil.convertDateTimeFormat(this.selectedDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_DDDD_MMM_DD_YYYY);

    this.locationId = Number(appointmentToOpen.locationId);
    this.providerId = Number(appointmentToOpen.providerId);

    (this.schedulerForm.get("cmbLocation") as FormControl).setValue(this.locationId);
    this.filterProviders();
    this.schedulerForm.get("datePicker").setValue(this.dateModel);

    //this.datePicker.navigateTo(this.dateModel);
    //debugger;
    //this.datePicker.navigateTo(this.dateModel);
    //this.isChangeEveApplicable = true;

    this.schedulerView = SchedulerViewType.NORMAL_VIEW;
    this.loadScheduler("outside");
  }

  ngOnInit() {

    debugger;
    //this.loadScheduler();
    this.schedulerForm = this.formBuilder.group({
      datePicker: this.formBuilder.control(this.dateModel),
      cmbLocation: this.formBuilder.control(this.locationId)
      //,cmbProvider: this.formBuilder.control(this.providerId)
    });


    //this.schedulerLoadedObservable.schedulerLoadedSuccessfully();
  }

  ngAfterViewChecked() {

    // if clled from outside then wait until view completed to navigate date
    if (!this.isChangeEveApplicable) {
      this.datePicker.navigateTo(this.dateModel);
      this.isChangeEveApplicable = true;
    }
  }

  getLocationProviders() {
    this.lstLocationProviders = undefined;
    this.schedulerService.getLocationProviders(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lstLocationProviders = data as Array<any>;
        //this.lstFileredProviders = new ListFilterPipe().transform(this.lstProviders, "location_id", this.locationId);

        if (this.lstLocationProviders != undefined && this.lstLocationProviders.length > 0) {
          this.filterProviders();
          this.preLoadingCount--;
          this.loadScheduler("inside");
        }
        else {
          this.isLoading = false;
        }
      },
      error => {
        this.ongetLocationProvidersError(error);
      }
    );
  }

  ongetLocationProvidersError(error) {
    this.logMessage.log("getLocationProviders Error.");
  }

  /*
  getSchedulerTiming() {

    this.lstSchedulerTiming = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "location_id", value: this.locationId, option: "" },
      { name: "provider_id", value: this.providerId, option: "" },
      { name: "scheduler_date", value: this.selectedDate, option: "" }
    ];

    this.schedulerService.getSchedulerTiming(searchCriteria).subscribe(
      data => {

        this.lstSchedulerTiming = data;


        this.preLoadingCount--;
        this.fetchAppointments();
      },
      error => {
        this.getSchedulerTimingError(error);
      }
    );
  }

  getSchedulerTimingError(error) {
    this.logMessage.log("getSchedulerTiming Error.");
  }
  */

  getAppointmentsWithTiming() {

    debugger;
    this.appointmentCountNormalView = 0;
    this.lstAppointments = undefined;
    this.lstSchedulerTiming = undefined;
    this.lstTimingInfo = undefined;
    this.isTempTimingApplied = false;
    this.isDayOff = false;
    this.isTimingNotAvailable = false;
    this.slot_size = 15;

    if (this.locationId == undefined || this.providerId == undefined || this.lstFileredProviders == undefined || this.lstFileredProviders.length == 0) {
      this.preLoadingCount = 0;
      this.isLoading = false;
      return;
    }

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "appointment_date", value: this.selectedDate, option: "" },
      { name: "location_id", value: this.locationId, option: "" },
      { name: "provider_id", value: this.providerId, option: "" },
      { name: "app_type_ids", value: "", option: "" }
    ];

    this.schedulerService.getAppointmentsWithTiming(searchCriteria).subscribe(
      data => {

        debugger;
        this.lstAppointments = data['lstAppointments'];
        this.lstSchedulerTiming = data['lstTiming'];
        this.lstTimingInfo = data['lstTimingInfo'];

        for (let info of this.lstTimingInfo) {

          switch (info.key) {
            case 'temp_applied':
              if (info.value == 'true') {
                this.isTempTimingApplied = true;
              }
              break;
            case 'off_day':
              if (info.value == 'true') {
                this.isDayOff = true;
              }
              break;
            case 'timing_not_avilable':
              if (info.value == 'true') {
                this.isTimingNotAvailable = true;
              }
              break;
            case 'column_count':
              this.totalColoums = Number(info.value);
              break;
            case 'appointment_count':
              this.appointmentCountNormalView = Number(info.value);
              break;

            default:
              break;
          }
        }
        if (this.lstSchedulerTiming != undefined && this.lstSchedulerTiming.length > 0) {
          this.slot_size = this.lstSchedulerTiming[0].slot_size;
        }
        this.preLoadingCount--;

        // Indicates if Scheduler Modules laoded. 
        // So that it can be called from other moudules
        if (!this.isSchedulerModuleLoaded) {
          this.isSchedulerModuleLoaded = true;
          this.schedulerLoadedObservable.schedulerLoadedSuccessfully();
        }


        this.isLoading = false;
      },
      error => {
        this.getAppointmentsWithTimingError(error);
      }
    );
  }
  getAppointmentsWithTimingError(error) {
    this.logMessage.log("getAppointmentsWithTiming Error.");
  }

  /*
  getAppointments() {

    this.appointmentCount = 0;
    this.lstAppointments = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "appointment_date", value: this.selectedDate, option: "" },
      { name: "location_id", value: this.locationId, option: "" },
      { name: "provider_id", value: this.providerId, option: "" },
      { name: "app_type_ids", value: "", option: "" }
    ];


    this.schedulerService.getAppointment(searchCriteria).subscribe(
      data => {

        this.lstAppointments = data;
        this.preLoadingCount--;
        this.fetchAppointments();
      },
      error => {
        this.ongetAppointmentsError(error);
      }
    );
  }

  
  ongetAppointmentsError(error) {
    this.logMessage.log("ongetAppointmentsError Error.");
  }
  */
  /*
    getProviderTiming() {
      this.lstProviderTiming = undefined;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "location_id", value: this.locationId, option: "" },
        { name: "provider_id", value: this.providerId, option: "" },
        { name: "scheduler_date", value: this.selectedDate, option: "" }
      ];
  
      this.schedulerService.getProviderTiming(searchCriteria).subscribe(
        data => {
  
          this.lstProviderTiming = data;
          this.preLoadingCount--;
          this.loadScheduler();
        },
        error => {
          this.getProviderTimingError(error);
        }
      );
    }
  
    getProviderTimingError(error) {
      this.logMessage.log("getProviderTiming Error.");
    }
    */


  /*
  getProviderTempTiming() {

    this.isTempTiming = false;
    this.lstProviderTempTiming = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "location_id", value: this.locationId, option: "" },
      { name: "provider_id", value: this.providerId, option: "" }
    ];

    this.schedulerService.getProviderTempTiming(searchCriteria).subscribe(
      data => {        
        this.lstProviderTempTiming = data;       
        this.preLoadingCount--;
        this.loadScheduler();
      },
      error => {
        this.getProviderTempTimingError(error);
      }
    );
  }

  getProviderTempTimingError(error) {
    this.logMessage.log("getProviderTempTiming Error.");
  }
*/
  /*
  fetchTempApplicableTiming(){
    this.isTempTiming = false;
    if(this.lstProviderTempTiming!=null && this.lstProviderTempTiming!=undefined && this.lstProviderTempTiming.length>0){

      let dtSelected:Date=this.dateTimeUtil.getDateTimeFromString(this.selectedDate,DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
      let dtTempFrom:Date;
      let dtTempTo:Date;

      for (let temp of this.lstProviderTempTiming) {

        dtTempFrom=this.dateTimeUtil.getDateTimeFromString(temp.date_from,DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        dtTempTo=this.dateTimeUtil.getDateTimeFromString(temp.date_to,DateTimeFormat.DATEFORMAT_MM_DD_YYYY);

        if(dtSelected >= dtTempFrom && dtSelected <= dtTempTo)
        {
          this.isTempTiming = true;          
          this.timingToApply=temp;
          break;
        }        
      }

    }
  }
*/

  navigdateToDate(option: string) {

    //let dtNow = new Date();
    let dtNew = new Date();
    let dtCurrent: Date = this.dateTimeUtil.getDateOjbect(this.dateTimeUtil.getStringDateFromDateModel(this.schedulerForm.get("datePicker").value));

    switch (option) {
      case "today":
        dtNew = new Date();
        //dtModelNew = { year: dtNew.getFullYear(), month: dtNew.getMonth() + 1, day: dtNew.getDate() };
        break;
      case "2_week":
        dtNew = this.dateTimeUtil.addDateTime(dtCurrent, 2, DatePart.WEEKS);
        break;
      case "4_week":
        dtNew = this.dateTimeUtil.addDateTime(dtCurrent, 4, DatePart.WEEKS);
        break;
      case "6_week":
        dtNew = this.dateTimeUtil.addDateTime(dtCurrent, 6, DatePart.WEEKS);
        break;
      case "8_week":
        dtNew = this.dateTimeUtil.addDateTime(dtCurrent, 8, DatePart.WEEKS);
        break;
      case "12_week":
        dtNew = this.dateTimeUtil.addDateTime(dtCurrent, 12, DatePart.WEEKS);
        break;

      default:
        break;
    }

    let dtModelNew = { year: dtNew.getFullYear(), month: dtNew.getMonth() + 1, day: dtNew.getDate() };
    this.schedulerForm.get("datePicker").setValue(dtModelNew);
    this.datePicker.navigateTo(dtModelNew);
    this.onDateChange(dtModelNew);
    //this.dateChanged(dtModelNew);
  }




  /*
  onDateNavigate(eventMY): void {
    debugger;
    let dtNew = { year: eventMY.year, month: eventMY.month, day: this.dateModel.day };
    //let dtNew = { year: eventMY.year, month: eventMY.month, day: 1 };
    this.schedulerForm.get("datePicker").setValue(dtNew);
    this.dateChanged(dtNew);
  }
  */
  /*
   onDateChange(dt): void {
     debugger;
     this.dateChanged(dt);
   }
 
   */
  onDateChange(dtNew) {
    debugger;
    if (!this.isChangeEveApplicable)
      return;
    // to avoid duplicate call of date change method
    if (dtNew.month === this.dateModel.month && dtNew.day === this.dateModel.day && dtNew.year === this.dateModel.year)
      return;

    this.dateModel = dtNew;

    this.selectedDate = String("00" + dtNew.month).slice(-2) + '/' + String("00" + dtNew.day).slice(-2) + '/' + String("0000" + dtNew.year).slice(-4);
    this.selectedDateDisplay = this.dateTimeUtil.convertDateTimeFormat(this.selectedDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_DDDD_MMM_DD_YYYY);

    //this.loadScheduler("inside");


    // loadAppointmentsOnly();
    //this.preLoadingCount = 1;
    //this.getAppointments();

    this.loadSchedulerView();
  }

  locationChanged() {

    debugger;
    this.locationId = this.schedulerForm.get("cmbLocation").value;
    this.filterProviders();

    this.loadSchedulerView();
    //this.loadScheduler("inside");
  }

  filterProviders() {


    if (this.lstLocationProviders == undefined)
      return;

    //let listFilterPipe: ListFilterPipe;
    this.lstFileredProviders = new ListFilterPipe().transform(this.lstLocationProviders, "location_id", this.locationId);

    if (this.lstFileredProviders != undefined && this.lstFileredProviders.length > 0) {
      let index: number = this.generalOperation.getitemIndex(this.lstFileredProviders, "provider_id", this.providerId);
      //this.providerId=undefined;
      if (index == undefined) {
        this.providerId = Number(this.lstFileredProviders[0].provider_id);
      }
      //console.log(this.lstFileredProviders.length);
    }
  }

  providerChanged(providerId) {

    this.providerId = Number(providerId);
    //this.providerId = this.schedulerForm.get("cmbProvider").value;

    //this.loadScheduler("inside");
    this.loadSchedulerView();
  }


  /*
  fetchAppointments() {

    this.appointmentCount = 0;

    if (this.preLoadingCount > 0) {
      return;
    }
    // alert("Need to move at the end time_slot_span")

    this.isDayOff = false;
    this.isTimingNotAvailable = false;
    this.isTempTimingApplied = false;
    let isBlockTimeExist = false;
    //let block_time_start
    //let block_tim_end=false;


    if (this.lstSchedulerTiming != undefined && this.lstSchedulerTiming.length > 0) {
      this.slot_size = this.lstSchedulerTiming[0].slot_size;

      if (this.lstSchedulerTiming[0].timing === "DAY_OFF") {
        this.isDayOff = true;
      }
      else if (this.lstSchedulerTiming[0].timing === "TIMING_NOT_AVILABLE") {
        this.isTimingNotAvailable = true;
      }
      this.isTempTimingApplied = this.lstSchedulerTiming[0].is_temp_applied;
    }
    else {
      this.slot_size = 15;
    }

    // check if timing not available and there is appointment against that time
    // also set appointment slot size for div span        
    if (this.lstAppointments != undefined && this.lstAppointments != null && this.lstAppointments.length > 0) {

      //this.appointmentCount=this.lstAppointments.length;
      this.totalColoums = 2;
      let time;
      let temp = 2;

      debugger;
      for (let app of this.lstAppointments) {

        if (app.patient_id === -1)// timing blocked
        {
          isBlockTimeExist = true;
        }

        if (app.patient_id > 0)
          this.appointmentCount++;


        if (app.appointment_time == time) {
          temp++;
          if (temp > this.totalColoums)
            this.totalColoums = temp;
        }
        else {
          if (temp > this.totalColoums)
            this.totalColoums = temp;

          temp = 2;
          time = app.appointment_time;
        }


        // set time slot for div span       
        if (app.appointment_duration > 0) {
          app.slot_count = app.appointment_duration / this.slot_size;
        }
        else {
          app.slot_count = "1";
        }

        let time_exist: boolean = false;
        let index: number = 0;
        for (let t of this.lstSchedulerTiming) {

          if (app.appointment_time === t.timing) {
            time_exist = true;
            break;
          }
        }

        if (time_exist == false) {

          debugger;
          let timeToInsert: Date = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + app.appointment_time, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
          let timeToCompare: Date;
          for (let t of this.lstSchedulerTiming) {

            if (t.timing === "BREAK_TIME")
              continue;

            timeToCompare = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + t.timing, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

            if (timeToCompare > timeToInsert) {

              if (this.lstSchedulerTiming[index].timing === 'BREAK_TIME') {
                index++
              }
              break;
            }
            index++;
          }
          debugger;
          this.lstSchedulerTiming.splice(index, 0, { id: 1, timing: app.appointment_time, slot_size: this.slot_size, is_temp_applied: false, info: '', enabled: false });


          // check for exteded
          if (app.appointment_duration > this.slot_size) {
            let startTime = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + app.appointment_time, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
            for (let i: number = 1; i < app.time_slot_span; i++) {

              time_exist = false

              let extendedTimeToInsert: Date = this.dateTimeUtil.addDateTime(startTime, (this.slot_size * i), DatePart.MINUTES);
              let extedtedTimeToMatch = this.dateTimeUtil.getDateTimeFormatedString(extendedTimeToInsert, DateTimeFormat.DATEFORMAT_hh_mm_a);

              let indexExtended: number = index + 1;
              for (let j: number = index + 1; j < this.lstSchedulerTiming.length; j++) {
                if (extedtedTimeToMatch === this.lstSchedulerTiming[j].timing) {
                  time_exist = true;
                  break;
                }

                timeToCompare = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + this.lstSchedulerTiming[j].timing, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

                if (timeToCompare > extendedTimeToInsert) {

                  debugger;
                  if (this.lstSchedulerTiming[indexExtended].timing === 'BREAK_TIME') {
                    indexExtended++
                  }
                  break;
                }
                indexExtended++;
              }
              debugger;
              if (time_exist == false) {
                this.lstSchedulerTiming.splice(indexExtended, 0, { id: 1, timing: extedtedTimeToMatch, slot_size: this.slot_size, is_temp_applied: false, info: '', enabled: false });
              }
            }
          }

        }

      }
    }
    else {
      for (let t of this.lstSchedulerTiming) {
        this.lstAppointments.push({ appointment_id: undefined, appointment_time: t.timing, slot_count: 1 });
      }
      this.appointmentCount = 0;
    }


    //disable time slot for new appointment if
    // day off/ no timing exist/ block time
    debugger;
    if (this.isDayOff || this.isTimingNotAvailable || isBlockTimeExist) {
      if (this.lstSchedulerTiming != undefined) {
        if (this.isDayOff || this.isTimingNotAvailable) {

          for (let t of this.lstSchedulerTiming) {
            t.enabled = false;
            t.info = this.isDayOff ? "Provider timing is Off." : "Provider timing is not available.";
          }
        }


        else if (isBlockTimeExist) {

          if (this.lstAppointments != undefined && this.lstAppointments != null && this.lstAppointments.length > 0) {

            for (let app of this.lstAppointments) {
              if (app.patient_id === -1) {

                let block_start_time = app.appointment_time;
                //let block_start_datetime = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + block_start_time, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

                //let block_duration = app.appointment_duration;
                //let block_end_timedatetime = this.dateTimeUtil.addDateTime(block_start_datetime, block_duration, DatePart.MINUTES);
                //let block_end_time = this.dateTimeUtil.getDateTimeFormatedString(block_end_timedatetime, DateTimeFormat.DATEFORMAT_hh_mm_a);

                let block: boolean = false;
                for (let t of this.lstSchedulerTiming) {
                  if (t.timing === block_start_time) {
                    //block = true;
                    debugger;
                    for (let i: number = 0; i < app.slot_count; i++) {
                      t.enabled = false;
                      t.info = "Provider timing is blocked."
                    }
                    break;
                  }

                  //if (block) {
                  //  t.disabled = true;
                  //  t.info = "Provider timing is blocked."
                  // }

                  //if (t.timing === block_end_time) {
                  //  block = false;
                  //  break;
                  // }
                }

              }
            }
          }
        }
      }
    }


    // Indicates if Scheduler Modules laoded. 
    // So that it can be called from other moudules
    if (!this.isSchedulerModuleLoaded) {
      this.isSchedulerModuleLoaded = true;
      this.schedulerLoadedObservable.schedulerLoadedSuccessfully();
    }


    this.isLoading = false;
  }
*/

  /*
    pupulateTimingList() {
  
      this.isTimingNotAvailable = true;
      this.slot_size = 15;
      this.time_start = undefined;
      this.time_end = undefined;
      this.break_enabled = false;
      this.break_start = undefined;
      this.break_end = undefined;
      this.isDayOff = false;
      this.appointmentCount=0;
      //this.lstSchedulerTiming = [];
  
      this.fetchTempApplicableTiming();   
  
      if (this.isTempTiming) {
        //timingToApply = this.lstProviderTempTiming;
        this.isDayOff = this.timingToApply.off_day;
      }
      else {
        let dayName = this.dateTimeUtil.getDayNameFromStringDate(this.selectedDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
        let lst=this.listFilterPipe.transform(this.lstProviderTiming, 'timing_day', dayName);
        if(lst.length>0)
        {
          this.timingToApply=lst[0];
        }
        else
        {
          this.timingToApply=undefined;
        }
      }
  
      if (this.isDayOff != true && this.timingToApply != undefined && this.timingToApply != null) {
        
        if (this.isTempTiming) {
           this.slot_size = this.timingToApply.slot_size;
           this.time_start = this.timingToApply.time_from;
           this.time_end = this.timingToApply.time_to;
           this.break_enabled = this.timingToApply.enable_break;
           this.break_start = this.timingToApply.break_from;
           this.break_end = this.timingToApply.break_to;
        }
        else {
          this.slot_size = this.timingToApply.slot;
          this.time_start = this.timingToApply.time_start;
          this.time_end = this.timingToApply.time_end;
  
          this.break_enabled = this.timingToApply.break_on;
          this.break_start = this.timingToApply.break_start;
          this.break_end = this.timingToApply.break_end;
        }
  
        let DateTimeStart: Date = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + this.time_start, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
        let DateTimeEnd: Date = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + this.time_end, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
  
        debugger;
        let isBreakAdded:boolean=false;
        while (DateTimeStart < DateTimeEnd) {
          this.isTimingNotAvailable = false;        
          if(this.break_enabled)
          {
              let DateTimeBreakStart: Date = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + this.break_start, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
              let DateTimeBreakEnd: Date = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + this.break_end, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
  
              if(DateTimeStart>=DateTimeBreakStart && DateTimeStart < DateTimeBreakEnd)
              {
                if( isBreakAdded==false)
                {
                  this.lstSchedulerTiming.push("BREAK");
                  isBreakAdded=true;
                }
                continue;
              }
          }
          this.lstSchedulerTiming.push(this.dateTimeUtil.getDateTimeFormatedString(DateTimeStart, DateTimeFormat.DATEFORMAT_hh_mm_a));
          DateTimeStart = this.dateTimeUtil.addDateTime(DateTimeStart, this.slot_size,DatePart.MINUTES);
        }
      }
      this.totalColoums=2;
      this.appointmentCount=0;
      // check if timing not available and there is appointment against that time
      // also set appointment slot size for div span    
      if (this.lstAppointments != undefined && this.lstAppointments != null && this.lstAppointments.length>0) {
  
        //this.appointmentCount=this.lstAppointments.length;
        this.totalColoums=2;
        let time;
        let temp=2;
  
        for (let app of this.lstAppointments) {
  
          if(app.patient_id>0)
              this.appointmentCount++;
  
        
          if(app.appointment_time==time)
          {
              temp++;
              if(temp > this.totalColoums)
                this.totalColoums=temp;
          }
          else
          {
            if(temp > this.totalColoums)
                this.totalColoums=temp;
  
            temp=2;
            time=app.appointment_time;
          }
  
          // set time slot for div span       
          if(app.appointment_duration>0)
          {
            app.time_slot_span=app.appointment_duration/this.slot_size;
          }
          else{
            app.time_slot_span="1";
          }       
  
          let time_exist: boolean = false;
          let index: number = 0;
          for (let t of this.lstSchedulerTiming) {
  
            if (app.appointment_time === t) {
              time_exist = true;
              break;
            }
          }
  
          if (time_exist == false) {
  
            let timeToInsert: Date = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + app.appointment_time, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
            let timeToCompare: Date;
            for (let t of this.lstSchedulerTiming) {
  
              if(t==="BREAK")
                continue;
  
              timeToCompare = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + t, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
  
              if (timeToCompare > timeToInsert) {
                break;
              }
              index++;
            }
  
            this.lstSchedulerTiming.splice(index, 0, app.appointment_time);
          }  
          
          
  
        }
      }
      else
      {
  
        //debugger;
        for (let t of this.lstSchedulerTiming) {
            this.lstAppointments.push({appointment_id:undefined,appointment_time:t,time_slot_span:1});
        }
        this.appointmentCount=0;
      }
    }
    */

  loadScheduler(calledFrom) {

    if (this.preLoadingCount > 0)
      return;

    if (calledFrom === "outside") {
      this.patientNameSearched = undefined;
      (document.getElementById('txtFindPatient') as HTMLInputElement).value = "";
    }
    if (calledFrom === "inside") {
      this.highlightSlotTime = undefined;
      this.patientIdSearched = undefined;
      this.patientNameSearched = undefined;
      (document.getElementById('txtFindPatient') as HTMLInputElement).value = "";
    }
    if (calledFrom === "find_patient") {
      this.highlightSlotTime = undefined;
      this.patientIdSearched = undefined;
    }



    //console.log('Provider:' + this.providerId + ' Location:' + this.locationId);

    this.isLoading = true;
    this.preLoadingCount = 1;
    //this.getSchedulerTiming();
    //this.getAppointments();

    debugger;
    this.getAppointmentsWithTiming();

  }

  getAppSources() {
    this.schedulerService.getAppSources(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        debugger;
        this.lookupList.appSourcesList = data as Array<any>;
        this.preLoadingCount--;
        //this.loadScheduler("inside");
        this.loadSchedulerView();
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


  getAppStatus() {
    this.schedulerService.getAppStatus(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.appStatusList = data as Array<any>;
        this.preLoadingCount--;
        //this.loadScheduler("inside");
        this.loadSchedulerView();
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
        //this.loadScheduler("inside");
        this.loadSchedulerView();
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

  getAppReasons() {
    this.schedulerService.getAppReasons(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {
        this.lookupList.appReasonsList = data as Array<any>;
        this.preLoadingCount--;
        //this.loadScheduler("inside");
        this.loadSchedulerView();
      },
      error => {
        this.getAppReasonsError(error);
        this.isLoading = false;
      }
    );
  }
  getAppReasonsError(error) {
    this.logMessage.log("getAppReasons Error.");
  }


  openAppointmentPopUp(appData: AppointmentOperationData) {

    //let appData: AppointmentOperationData = new AppointmentOperationData();
    //appData.appOption = option;
    // appData.providerId = this.providerId;
    // appData.locationId = this.locationId;
    // appData.appDate = this.selectedDate;
    // appData.appTime = appTime;
    // appData.appDuration = 15;

    const modalRef = this.ngbModal.open(AppointmentPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.appData = appData;
    modalRef.componentInstance.lstLocations = this.lstLocations;
    modalRef.componentInstance.lstProviders = this.lstLocationProviders;
    modalRef.componentInstance.lstSchedulerTiming = this.lstSchedulerTiming;

    if (appData.appOption == AppointmentOptions.ADD) {
      modalRef.componentInstance.addPatient.subscribe(($event) => {
        //console.log("Add New Patient");
        this.patientIdSelected = undefined;
        this.patientAddEditOperation = OperationType.ADD;
        this.addEditPatientFlag = true;
      })
    }

    let closeResult;

    modalRef.result.then((result) => {

      debugger;
      if (result) {
        //this.loadScheduler("inside");
        this.forceViewReload = true;
        this.loadSchedulerView();
      }
    }
      , (reason) => {
        //alert(reason);
      });
  }

  doSchedulerAction(appOperationData: AppointmentOperationData) {

    debugger;
    //appOperationData.locationId = this.locationId;
    //appOperationData.providerId = this.providerId;

    debugger;
    switch (appOperationData.appOption) {
      case AppointmentOptions.DELETE:
        this.deletAppointment(appOperationData);
        break;
      case AppointmentOptions.EDIT:
        this.editAppointment(appOperationData);
        break;
      case AppointmentOptions.CHECKIN_CHECKOUT:
        this.showCheckInCheckOutPopUp(appOperationData);
        break;
      case AppointmentOptions.SHOW_ELIGIBLITY:
        this.showEligibility(appOperationData, false);
        break;
      case AppointmentOptions.CHECK_LIVE_ELIGIBLITY:
        this.showEligibility(appOperationData, true);
        break;
      case AppointmentOptions.CASH_REGISTER:
        this.showCashRegister(appOperationData);
        break;
      case AppointmentOptions.MODIFY_PATIENT:
        this.patientIdSelected = appOperationData.patientId;
        this.addEditPatientFlag = true;
        this.patientAddEditOperation = OperationType.EDIT;
        break;
      case AppointmentOptions.PRINT_DEMOGRAPHICS:
        this.printDemographics(appOperationData.patientId);
        break;
      case AppointmentOptions.CREATE_ENCOUNTER:
        this.createEncounter(appOperationData);
        break;
      case AppointmentOptions.ENCOUNTER_SNAPSHOT:
        this.encounterSnapShot(appOperationData);
        break;
      case AppointmentOptions.SCHEDULER_PATIENT_APPOINTMENT_REPORT:
        this.lstAppiontmentReportData = new Array();
        this.lstAppiontmentReportData.push(new ORMKeyValue('callingFrom', AppointmentOptions.SCHEDULER_PATIENT_APPOINTMENT_REPORT))
        this.lstAppiontmentReportData.push(new ORMKeyValue('patientId', appOperationData.patientId));
        this.lstAppiontmentReportData.push(new ORMKeyValue('headerText', appOperationData.patientName + " | DOB:" + appOperationData.dob));

        this.showScheduler = false;
        this.showSchedulerReport = true;
        break;
      case AppointmentOptions.PATIENT_NOTES:

        const modalRef = this.ngbModal.open(PatientNotesComponent, this.lgPopUpOptions);

        modalRef.componentInstance.patientId = appOperationData.patientId;
        modalRef.componentInstance.patientName = appOperationData.patientName;
        modalRef.componentInstance.dob = appOperationData.dob;
        modalRef.componentInstance.callingFrom = CallingFromEnum.SCHEDULER;
        break;

      case AppointmentOptions.CALL_LOG:
        this.showCallLog(appOperationData);
        break;
      case AppointmentOptions.APPOINTMENT_LOG:
        this.showApptLog(appOperationData);
        break;


      default:
        break;
    }
  }

  addAppointment(appSlot) {

    if (this.isDayOff || this.isTimingNotAvailable || !appSlot.enabled) {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Scheduler"

      let msg = "";
      if (this.isDayOff) {
        msg = "Provider Day is Off."
      }
      else if (this.isTimingNotAvailable) {
        msg = "Provider Timing is not available."
      }
      else {
        msg = appSlot.info;
      }


      modalRef.componentInstance.promptMessage = msg;

      let closeResult;

      modalRef.result.then((result) => {
        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });

      return
    } else {

      this.selectedTime = appSlot.timing;

      let appData: AppointmentOperationData = new AppointmentOperationData();
      appData.appOption = AppointmentOptions.ADD;
      appData.providerId = this.providerId;
      appData.locationId = this.locationId;
      appData.appDate = this.selectedDate;
      appData.appTime = this.selectedTime;
      appData.appDuration = this.slot_size;

      this.openAppointmentPopUp(appData);
    }

  }

  editAppointment(appOperationData: AppointmentOperationData) {

    //let appData: AppointmentOperationData = new AppointmentOperationData();
    //appData.appOption = AppointmentOptions.EDIT;
    //appData.appointmentId=appOperationData.appointmentId;
    //appData.providerId =appOperationData.providerId;
    //appData.locationId =appOperationData.locationId;
    //appData.appDate = appOperationData.appDate;
    //appData.appTime = appOperationData.appTime;
    //appData.patientName=appOperationData.patientName;
    //appData.patientId=appOperationData.patientId;

    // appData.appDuration = this.slot_size;// appOperationData. 15;

    this.openAppointmentPopUp(appOperationData);
  }


  deletAppointment(appOperationData: AppointmentOperationData) {

    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion !';
    modalRef.componentInstance.promptMessage = 'Do you want to delete the selected appointment ?<br>' + appOperationData.patientName + " : " + appOperationData.appDate + " " + appOperationData.appTime;
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {

      if (result == PromptResponseEnum.YES) {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = appOperationData.appointmentId.toString();
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.schedulerService.deleteAppointments(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data),
            error => alert(error),
            () => this.logMessage.log("delete Personal Injury Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(data) {

    if (data.status === ServiceResponseStatusEnum.NOT_ALLOWED) {
      //alert("Not Allowed\n" + data.response);

      let isBlocked: boolean = false;
      let isTimeNotAvailable: boolean = false;
      let isSlotLimitCompleted: boolean = false;
      let isEncounterDateMismatched: boolean = false;

      let msg = "Appointment can't be deleted. It contains follwoing information.";

      if (data.response_list != undefined && data.response_list.length > 0) {

        for (let r of data.response_list) {

          if (r.key == "encounter_exist") {
            msg += "Encounter, "
          }
          else if (r.key == "claim_exist") {
            msg += "Claim, "
          }
          else if (r.key == "patient_payment_exist") {
            msg += "Patient Payment, "
          }
        }
      }

      const modalRef = this.ngbModal.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Scheduler"
      modalRef.componentInstance.promptMessage = msg;

      let closeResult;

      modalRef.result.then((result) => {


        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          //alert(reason);
        });
    }
    else {
      //this.loadScheduler("inside");
      this.loadSchedulerView();
    }
  }

  showCheckInCheckOutPopUp(appData: AppointmentOperationData) {

    const modalRef = this.ngbModal.open(CheckInOutPopupComponent, this.poupUpOptions);
    modalRef.componentInstance.appOperationData = appData;

    let closeResult;

    modalRef.result.then((result) => {

      if (result === ServiceResponseStatusEnum.SUCCESS) {
        //this.loadScheduler("inside");
        this.loadSchedulerView();
      }
    }
      , (reason) => {
        //alert(reason);
      });

  }

  showReport() {

    debugger;
    this.lstAppiontmentReportData = new Array();

    this.lstAppiontmentReportData.push(new ORMKeyValue('callingFrom', CallingFromEnum.SCHEDULER))
    this.lstAppiontmentReportData.push(new ORMKeyValue('providerId', this.providerId.toString()))
    this.lstAppiontmentReportData.push(new ORMKeyValue('locationId', this.locationId.toString()))
    this.lstAppiontmentReportData.push(new ORMKeyValue('appointmentDate', this.selectedDate))

    this.showScheduler = false;
    this.showSchedulerReport = true;

  }

  showSettings() {
    this.showScheduler = false;
    this.showSchedulerSettings = true;
  }

  navigateBackToScheduler() {
    this.showSchedulerReport = false;
    this.showSchedulerSettings = false;
    this.showScheduler = true;
  }


  showEligibility(appData: AppointmentOperationData, checkLive: boolean) {

    debugger;

    const modalRef = this.ngbModal.open(PatientEligibilityComponent, this.xLgPoupUpOptions);
    modalRef.componentInstance.patientId = appData.patientId;
    modalRef.componentInstance.id = appData.appointmentId;
    modalRef.componentInstance.idType = "appointment";
    modalRef.componentInstance.checkLive = checkLive;
    modalRef.componentInstance.insuranceType = "Primary";
    modalRef.componentInstance.dos = this.dateTimeUtil.convertDateTimeFormat(appData.appDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_YYYYMMDD);

    let closeResult;

    modalRef.result.then((result) => {

      if (result === ServiceResponseStatusEnum.SUCCESS) {
        this.loadSchedulerView();
        //this.loadScheduler("inside");
      }
    }
      , (reason) => {
        //alert(reason);
      });
  }

  showCashRegister(appData: AppointmentOperationData) {

    const modalRef = this.ngbModal.open(CashRegisterComponent, this.lgPopUpOptions);
    modalRef.componentInstance.appData = appData;
    //modalRef.componentInstance.patientId = appData.patientId;
    //modalRef.componentInstance.appointmentId=appData.appointmentId;

    //modalRef.componentInstance.locationId = this.locationId;
    //modalRef.componentInstance.providerId = this.providerId;
    //modalRef.componentInstance.dos = appData.appDate;

    let closeResult;

    modalRef.result.then((result) => {

      if (result === ServiceResponseStatusEnum.SUCCESS) {
        //this.loadScheduler("inside");
      }
    }
      , (reason) => {
        //alert(reason);
      });

  }



  onAddEditPatientSaved(patientToOpen: PatientToOpen) {
    debugger;
    this.addEditPatientFlag = false;
    if (this.patientAddEditOperation == "add") // called for Add New Patient from popup
    {

      let appData: AppointmentOperationData = new AppointmentOperationData();
      appData.appOption = AppointmentOptions.ADD;
      appData.providerId = this.providerId;
      appData.locationId = this.locationId;
      appData.appDate = this.selectedDate;
      appData.appTime = this.selectedTime;
      appData.appDuration = this.slot_size;
      appData.patientId = patientToOpen.patient_id;
      this.openAppointmentPopUp(appData);

    }
    else if (this.patientAddEditOperation == "edit") // called for Edit Patient from scheduler
    {
      this.loadScheduler("outside");
    }
  }

  onAddEditPatientCancelled() {
    debugger;
    this.addEditPatientFlag = false;

    if (this.patientAddEditOperation == "add") // called for Add New Patient from popup
    {

      let appData: AppointmentOperationData = new AppointmentOperationData();
      appData.appOption = AppointmentOptions.ADD;
      appData.providerId = this.providerId;
      appData.locationId = this.locationId;
      appData.appDate = this.selectedDate;
      appData.appTime = this.selectedTime;
      appData.appDuration = this.slot_size;
      appData.patientId = undefined;
      this.openAppointmentPopUp(appData);

    }

  }

  printDemographics(patientId: number) {

    const modalRef = this.ngbModal.open(PrintDemographicsComponent, this.lgPopUpOptions);
    modalRef.componentInstance.patientId = patientId;

    modalRef.result.then((result) => {

      if (result != undefined) {

      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  createEncounter(appOperationData: AppointmentOperationData) {


    let objormpatientchart: ORMPatientChart = new ORMPatientChart;
    objormpatientchart.patient_id = appOperationData.patientId.toString();
    objormpatientchart.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    objormpatientchart.location_id = appOperationData.locationId.toString();//this.locationId.toString();
    objormpatientchart.provider_id = appOperationData.providerId.toString();//this.providerId.toString();
    objormpatientchart.visit_date = appOperationData.appDate + ' ' + appOperationData.appTime;
    objormpatientchart.appointment_id = appOperationData.appointmentId.toString();
    objormpatientchart.modified_user = this.lookupList.logedInUser.user_name;
    objormpatientchart.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    objormpatientchart.no_allergy = false;
    objormpatientchart.no_problem = false;
    objormpatientchart.no_med = false;
    objormpatientchart.external_education = false;
    objormpatientchart.med_reviewed = false;
    objormpatientchart.created_user = this.lookupList.logedInUser.user_name;
    objormpatientchart.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    this.encounterService.createNewChart(objormpatientchart).subscribe(
      data => {
        debugger;

        if (data['status'] === ServiceResponseStatusEnum.SUCCESS) {
          let obj: PatientToOpen = new PatientToOpen();
          obj.patient_id = appOperationData.patientId;
          obj.patient_name = appOperationData.patientName;
          obj.child_module = PatientSubTabsEnum.ENCOUNTER;
          obj.child_module_id = Number(data['result']);
          obj.callingFrom = CallingFromEnum.SCHEDULER;
          this.openModuleService.openPatient.emit(obj);

        }
        else if (data['status'] === ServiceResponseStatusEnum.ERROR) {
          GeneralOperation.showAlertPopUp(this.ngbModal, 'Create Encounter', data['response'], AlertTypeEnum.DANGER)
        }
      },
      error => {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Create Encounter', error.message, AlertTypeEnum.DANGER)
        //this.logMessage.log("newchart " + error);
      }
    );


    /*
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = appOperationData.patientId;
    obj.patient_name = appOperationData.patientName;
    obj.child_module = PatientSubTabsEnum.ENCOUNTER;    
    obj.callingFrom = CallingFromEnum.SCHEDULER;
    this.openModuleService.openPatient.emit(obj);
    */


  }

  encounterSnapShot(appOperationData: AppointmentOperationData) {

    let data: any = { appointment_id: appOperationData.appointmentId, visit_date: appOperationData.appDate, patient_id: appOperationData.patientId, chart_id: '' };

    const modalRef = this.ngbModal.open(EncounterSnapshotComponent,  this.popUpOptionsLg);
    modalRef.componentInstance.getPatientVisitSnapShot(data);

  }
  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  showCallLog(appData: AppointmentOperationData) {
    const modalRef = this.ngbModal.open(CallsLogComponent, this.xLgPoupUpOptions);
    modalRef.componentInstance.appOperationData = appData;

    modalRef.result.then((result) => {

      debugger;
      if (result == true) {
        this.loadSchedulerView();
        //this.loadScheduler("inside");
      }
    }
      , (reason) => {

        //alert(reason);
      });
  }


  showApptLog(appData: AppointmentOperationData) {

    let lstOtherCriteria = new Array<ORMKeyValue>();
    lstOtherCriteria.push(new ORMKeyValue("appointment_id", appData.appointmentId));

    let logParameters: LogParameters = new LogParameters();
    logParameters.logName = "appointment_log";
    logParameters.logDisplayName = "Appointment Log";
    logParameters.logMainTitle = "Appointment Log";
    logParameters.patientId = appData.patientId;
    logParameters.enableSearch = false;
    logParameters.callingFrom = CallingFromEnum.SCHEDULER;

    logParameters.lstOtherCriteria = lstOtherCriteria;

    const modalRef = this.ngbModal.open(LogPopUpComponent, this.lgPopUpOptions);
    modalRef.componentInstance.param = logParameters;

  }

  onFindPatientSearchKeydown(patName: string) {

    debugger;
    this.highlightSlotTime = undefined;
    this.patientIdSearched = undefined;
    this.patientNameSearched = patName;
    //this.loadScheduler("find_patient");
  }


  schedulerView: SchedulerViewType = SchedulerViewType.NORMAL_VIEW;
  refreshView: boolean = false;
  forceViewReload: boolean = false;

  //locationViewParam:SchedulerViewParm=new SchedulerViewParm();
  //providerViewParam:SchedulerViewParm=new SchedulerViewParm();
  //monthViewParam:SchedulerViewParm=new SchedulerViewParm();
  locationName: string;
  providerName: string;
  loadSchedulerView() {

    this.appointmentCountNormalView = 0;
    this.appointmentCountLocationView = 0;
    this.appointmentCountProviderView = 0;
    this.appointmentCountMonthView = 0;
    
    this.patientNameSearched = undefined;
    (document.getElementById('txtFindPatient') as HTMLInputElement).value = "";

    switch (this.schedulerView) {
      case SchedulerViewType.NORMAL_VIEW:
        this.loadScheduler("inside");
        break;
      case SchedulerViewType.LOCATION_VIEW:
        break;
      case SchedulerViewType.PROVIDER_VIEW:
        break;
      case SchedulerViewType.MONTH_VIEW:

        this.providerName = '';
        let index: number = this.generalOperation.getitemIndex(this.lstLocations, "id", this.locationId);
        if (index != undefined) {
          this.locationName = this.lstLocations[index].name;
        }
        else {
          this.locationName = '';
        }
        index = this.generalOperation.getitemIndex(this.lstFileredProviders, "provider_id", this.providerId);
        if (index != undefined) {
          this.providerName = this.lstFileredProviders[index].provider_name;
        }
        else {
          this.providerName = '';
        }

        break;
      default:
        break;
    }
    this.refreshView = this.forceViewReload;
  }

  onTabChange(event: NgbTabChangeEvent) {
    this.schedulerView = event.nextId as SchedulerViewType;
    this.loadSchedulerView();
  }


  loadingIndicator(event: any) {

    debugger;
    this.isLoading = event.isLoading;
    if (event.schedulerView == SchedulerViewType.MONTH_VIEW) {
      this.appointmentCountMonthView = event.appCount;
    }
    else if (event.schedulerView == SchedulerViewType.LOCATION_VIEW) {
      this.appointmentCountLocationView = event.appCount;
    }
    if (event.schedulerView == SchedulerViewType.PROVIDER_VIEW) {
      this.appointmentCountProviderView = event.appCount;
    }

    if (this.isLoading == false) {
      this.refreshView = false;
      this.forceViewReload = false;
    }
  }

  callBackloadNormalSchedulerView(lstKV: Array<ORMKeyValue>) {

   

    this.schedulerView = SchedulerViewType.NORMAL_VIEW
    let callFrom: CallingFromEnum;
    let dateModel: DateModel;

    lstKV.forEach(kv => {

      switch (kv.key) {
        case 'callingFrom':
          callFrom = kv.value as CallingFromEnum;
          break;
        case 'dateModel':
          dateModel = kv.value;
          break;

        default:
          break;
      }
    });

    if (callFrom == CallingFromEnum.SCHEDULER_MONTH_VIEW) {
      this.dateModel = dateModel;
      this.selectedDate = String("00" + (this.dateModel.month)).slice(-2) + '/' + String("00" + this.dateModel.day).slice(-2) + '/' + String("0000" + this.dateModel.year).slice(-4);
      this.selectedDateDisplay = this.dateTimeUtil.convertDateTimeFormat(this.selectedDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY, DateTimeFormat.DATEFORMAT_DDDD_MMM_DD_YYYY);

      this.schedulerForm.get("datePicker").setValue(this.dateModel);
      this.loadSchedulerView();
    }
  }
}

