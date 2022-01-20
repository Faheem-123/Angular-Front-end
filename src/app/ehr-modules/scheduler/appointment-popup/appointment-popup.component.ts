import { Component, OnInit, Input, Inject, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentOperationData, AppointmentOptions } from '../appointment-operation-data';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from '../../../providers/lookupList.module';
import { LogMessage } from '../../../shared/log-message';
import { ListFilterPipe } from '../../../shared/list-filter-pipe';
import { SearchCriteria } from '../../../models/common/search-criteria';
import { SchedulerService } from '../../../services/scheduler/scheduler.service';
import { DateTimeUtil, DateTimeFormat, DatePart } from '../../../shared/date-time-util';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap/tabset/tabset';
import { CustomValidators, datetimeValidator } from '../../../shared/custome-validators';
import { ORMSaveAppointment } from '../../../models/scheduler/orm-save-appointment';
import { WrapperObjectSave } from '../../../models/general/wrapper-object-save';
import { ORMKeyValue } from '../../../models/general/orm-key-value';
import { ServiceResponseStatusEnum, PromptResponseEnum, AlertTypeEnum } from '../../../shared/enum-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ConfirmationPopupComponent } from '../../../general-modules/confirmation-popup/confirmation-popup.component';
import { AlertPopupComponent } from '../../../general-modules/alert-popup/alert-popup.component';
import { PatientService } from 'src/app/services/patient/patient.service';
import { DateModel } from 'src/app/models/general/date-model';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { PatientNotesComponent } from '../../patient/patient-notes/patient-notes.component';

@Component({
  selector: 'appointment-popup',
  templateUrl: './appointment-popup.component.html',
  styleUrls: ['./appointment-popup.component.css']
})
export class AppointmentPopupComponent implements OnInit {

  @Input() appData: AppointmentOperationData;
  @Input() lstLocations: Array<any>;
  @Input() lstProviders: Array<any>;
  @Input() lstSchedulerTiming: Array<any>;

  @Output() addPatient = new EventEmitter<any>();

  @ViewChild('txtPatientSearch') txtPatientSearch: ElementRef;
  @ViewChild('inlineAddAppPatSearch') inlineAddAppPatSearch: InlinePatientSearchComponent;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  appointmentForm: FormGroup;

  isLoading: boolean = true;
  appOperation: string = "New";
  loadingMsg = "Loading";

  locationId: number;
  providerId: number;
  appTime: string;
  appDuration: number;
  dateModel: DateModel;
  lstFileredProviders: Array<any>;

  lstStartTiming: Array<any>;
  lstEndTiming: Array<any>;
  lstDuration: Array<any>;

  showPatientSearch: boolean = false;
  appointmentId: number;
  patientId: number;
  patientName: string;
  pid: string;
  dob: string;
  gender: string;

  phone: string;
  statusId: number = 50010111;
  typeId: number;
  reasonId: number;
  comments: string;

  objAppDetails: any;

  selectedDate: string;
  isTimingNotAvailable: boolean = false;
  isDayOff: boolean = false;
  isTempTimingApplied: boolean = false
  slot_size: number = 15;

  preLoadingCount: number = 0;

  isPatientAppointment: boolean = true;
  isBlockTime: boolean = false;
  patPicURL: string;
  //downloadPath: string;
  lstErrors: Array<string> = [];

  isInitialLoading: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private schedulerService: SchedulerService,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private patientService: PatientService,
    private generalOperation: GeneralOperation) {
  }


  ngOnInit() {

    debugger;
    //this.patPicURL = this.lookupList.defaultPatPic;

    //if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
    //  this.downloadPath = this.lookupList.lstdocumentPath[0].download_path;
    // }

    debugger;
    this.appOperation = this.appData.appOption == AppointmentOptions.ADD ? "New" : this.appData.appOption == AppointmentOptions.EDIT ? "Modify" : "";


    this.appTime = this.appData.appTime;
    this.selectedDate = this.appData.appDate;
    this.appDuration = this.appData.appDuration;
    this.comments = this.appData.comments;
    this.lstStartTiming = this.lstSchedulerTiming.slice();
    this.dob = this.appData.dob;
    this.locationId = this.appData.locationId;
    this.providerId = this.appData.providerId;

    //this.gender=this.appData.gender;
    //this.phone=this.appData.phone;

    //let dt: Date = this.dateTimeUtil.getDateTimeFromstring(this.selectedDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    this.dateModel = this.dateTimeUtil.getDateModelFromDateString(this.selectedDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    // { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };


    if (this.appData.appOption === AppointmentOptions.ADD) {

      this.locationId = this.appData.locationId;
      this.providerId = this.appData.providerId;
      //this.statusId=this.appData.statusId;
      //this.typeId=this.appData.typeId;
      //this.reasonId=this.appData.reasonId;
      //this.pid=this.appData.pid;
      this.lstFileredProviders = new ListFilterPipe().transform(this.lstProviders, "location_id", this.locationId.toString());

      debugger;
      this.getSchedulerTiming();

      if (this.appData.patientId != undefined) {
        this.patientId = this.appData.patientId;
        this.getPatientHeaderInfo();
      }

      debugger;
      this.typeId = new ListFilterPipe().transform(this.lookupList.appSettings, "description", "app_type")[0].options.toString();

      if (this.typeId == undefined && this.lookupList.appTypesList != undefined && this.lookupList.appTypesList.length > 0) {
        this.typeId == this.lookupList.appTypesList[0].id;
      }
    }
    else if (this.appData.appOption == AppointmentOptions.EDIT) {

      this.isInitialLoading = true;
      this.appointmentId = this.appData.appointmentId;
      this.patientName = this.appData.patientName;
      this.patientId = this.appData.patientId;
      this.getAppointmentDetails();
    }


    this.buildForm();
    this.appointmentForm.get("cmbStartTiming").setValue(this.appTime);
  }


  ngAfterViewInit() {
    if (this.txtPatientSearch != undefined) {
      this.txtPatientSearch.nativeElement.focus();
    }
  }
  getPatientHeaderInfo() {
    this.patientService.getPatientHeader(this.patientId).subscribe(
      data => {
        this.onHeaderSuccessfull(data);
      },
      error => {
        this.onHeaderError(error);
      }
    );
  }
  onHeaderSuccessfull(data) {

    debugger;
    //this.appointmentId = this.appData.appointmentId;

    this.patientName = data.last_name + ', ' + data.first_name;

    this.patientId = data.patient_id;

    this.dob = data.dob;
    this.pid = data.alternate_account;

    //this.gender = data.gender;

    if (data.gender_code == 'F') {
      this.gender = "FEMALE";
    }
    else if (data.gender_code == 'M') {
      this.gender = "MALE";
    }
    else if (data.gender_code == 'U') {
      this.gender = "UNKNOWN";
    }
    else {
      this.gender = "";
    }

    this.appointmentForm.get("txtPatientIdHidden").setValue(this.patientId);
    this.appointmentForm.get("txtPatientSearch").setValue(this.patientName);

    this.patPicURL = this.generalOperation.getPatientPicturePath(data.pic, data.gender_code);

    //this.loadPatPicture(data);
  }
  onHeaderError(error) {
    this.logMessage.log("onHeaderError Error.");
  }

  buildForm() {

    debugger;
    this.appointmentForm = this.formBuilder.group({
      txtPatientSearch: this.formBuilder.control(null),
      txtPatientIdHidden: this.formBuilder.control(null, Validators.required),
      cmbLocation: this.formBuilder.control(this.locationId, Validators.required),
      cmbProvider: this.formBuilder.control(this.providerId, Validators.required),
      dpAppDate: this.formBuilder.control(this.dateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      cmbStartTiming: this.formBuilder.control(this.appTime),
      cmbEndTiming: this.formBuilder.control(this.appTime),
      cmbDuration: this.formBuilder.control(this.appDuration),
      cmbStatus: this.formBuilder.control(this.statusId),
      txtComments: this.formBuilder.control(this.comments),

      cmbType: this.formBuilder.control(this.typeId),
      cmbVisitReason: this.formBuilder.control(this.reasonId),
      entryOption: this.formBuilder.control('appointment'),
      cmbBlockOption: this.formBuilder.control('blocktime'),

    },
      {
        validator: Validators.compose([
          CustomValidators.requiredWhenOneOptionWithValue('cmbDuration', 'entryOption', 'appointment'),
          CustomValidators.requiredWhenOneOptionWithValue('cmbStatus', 'entryOption', 'appointment'),
          CustomValidators.requiredWhenOneOptionWithValue('cmbStartTiming', 'entryOption', 'appointment'),
          CustomValidators.requiredWhenTwoOptionWithValue('cmbEndTiming', 'entryOption', 'block', 'cmbBlockOption', 'blocktime')
        ])
      }
    )
  }

  getAppointmentDetails() {
    debugger;
    this.loadingMsg = "Loading";
    this.isLoading = true;
    this.schedulerService.getAppointmentDetails(this.appointmentId).subscribe(
      data => {
        this.objAppDetails = data;
        this.getAppointmentDetailsSuccess();
        this.isLoading = false;
      },
      error => {
        this.getAppointmentDetailsError(error);
        this.isLoading = false;
      }
    );


  }

  getAppointmentDetailsSuccess() {

    debugger
    if (this.objAppDetails != undefined) {

      this.locationId = this.objAppDetails.location_id;
      this.providerId = this.objAppDetails.provider_id;

      this.pid = this.objAppDetails.pid;
      //this.gender = this.objAppDetails.gender;
      if (this.objAppDetails.gender_code == 'F') {
        this.gender = "FEMALE";
      }
      else if (this.objAppDetails.gender_code == 'M') {
        this.gender = "MALE";
      }
      else if (this.objAppDetails.gender_code == 'U') {
        this.gender = "UNKNOWN";
      }
      else {
        this.gender = "";
      }


      debugger;
      this.statusId = this.objAppDetails.status_id;
      this.typeId = this.objAppDetails.type_id;
      this.reasonId = this.objAppDetails.reason_id;


      this.lstFileredProviders = new ListFilterPipe().transform(this.lstProviders, "location_id", this.locationId.toString());

      this.appointmentForm.get("txtPatientIdHidden").setValue(this.patientId);
      this.appointmentForm.get("cmbLocation").setValue(this.locationId);
      this.appointmentForm.get("cmbProvider").setValue(this.providerId);
      this.appointmentForm.get("cmbStatus").setValue(this.statusId);
      this.appointmentForm.get("cmbType").setValue(this.typeId);
      this.appointmentForm.get("cmbVisitReason").setValue(this.reasonId);

      this.patPicURL = this.generalOperation.getPatientPicturePath(this.objAppDetails.pic, this.objAppDetails.gender_code);

      //this.loadPatPicture(this.objAppDetails);

      this.getSchedulerTiming();
    }
  }

  getAppointmentDetailsError(error) {
    this.logMessage.log("getAppointmentDetails Error.");
  }



  onPatientSearchKeydown(event) {


    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else if (event.key == 'ArrowDown') {
      debugger;
      this.shiftFocusToInsSearch();
    }
    else {
      this.showPatientSearch = false;
    }
  }

  shiftFocusToInsSearch() {
    this.inlineAddAppPatSearch.focusFirstIndex();
  }

  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {


      this.patientId = undefined;
      this.appointmentForm.get("txtPatientIdHidden").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    this.logMessage.log("onPatientSearchBlur");

    if (this.patientId == undefined && this.showPatientSearch == false) {
      this.patientName = undefined;
      this.appointmentForm.get("txtPatientSearch").setValue(null);
      this.appointmentForm.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }

  openSelectPatient(patObject) {
    this.logMessage.log(patObject);

    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      this.show = false;
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;

      let closeResult;

      modalRef.result.then((result) => {
        this.show = true;

        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          this.show = true;
          //alert(reason);
        });

      return;
    }


    debugger;
    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;

    this.dob = patObject.dob;
    this.pid = patObject.alternate_account;
    //this.gender = patObject.gender;

    if (patObject.gender_code == 'F') {
      this.gender = "FEMALE";
    }
    else if (patObject.gender_code == 'M') {
      this.gender = "MALE";
    }
    else if (patObject.gender_code == 'U') {
      this.gender = "UNKNOWN";
    }
    else {
      this.gender = "";
    }

    this.appointmentForm.get("txtPatientIdHidden").setValue(this.patientId);
    this.appointmentForm.get("txtPatientSearch").setValue(this.patientName);

    if (this.lookupList.UserRights.pat_staffnotes || this.lookupList.UserRights.pat_phynotes)
      this.getStaffNoteAlert();

    this.showPatientSearch = false;

    this.patPicURL = this.generalOperation.getPatientPicturePath(patObject.pic, patObject.gender_code);
    //this.loadPatPicture(patObject);
  }
  getStaffNoteAlert() {
    this.patientService.getStaffNoteAlert(this.patientId).subscribe(
      data => {
        if ((data as Array<any>).length > 0) {
          const modalRef = this.modalService.open(PatientNotesComponent, this.NotesPoupUp);
          modalRef.componentInstance.patientId = this.patientId;
          modalRef.componentInstance.patientName = this.patientName;
          modalRef.componentInstance.dob = this.dob;
          modalRef.componentInstance.callingFrom = 'alert';
        }
      },
      error => {

      }
    );
  }
  NotesPoupUp: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  locationChanged() {
    debugger;
    //this.providerId=undefined;
    this.locationId = this.appointmentForm.get("cmbLocation").value;
    this.logMessage.log("provider id:" + this.appointmentForm.get("cmbProvider").value);

    this.lstFileredProviders = new ListFilterPipe().transform(this.lstProviders, "location_id", this.locationId);

    if (this.lstFileredProviders != undefined && this.lstFileredProviders.length > 0) {
      this.providerId = this.lstFileredProviders[0].provider_id;
      this.appointmentForm.get("cmbProvider").setValue(this.providerId);
    }
    else {
      this.providerId = undefined;
      this.appointmentForm.get("cmbProvider").setValue(null);
    }

    this.getSchedulerTiming();
    this.appointmentForm.get("cmbTiming").reset();
    this.appointmentForm.get("cmbDuration").reset();
  }

  providerChanged() {
    debugger;
    this.providerId = this.appointmentForm.get("cmbProvider").value;
    this.getSchedulerTiming();
  }

  getSchedulerTiming() {
    debugger;

    if (!this.dateTimeUtil.isValidDateTime(this.selectedDate, DateTimeFormat.DATEFORMAT_MM_DD_YYYY)) {
      return;
    }

    this.loadingMsg = "Loading";
    this.isLoading = true;
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
        debugger;
        this.isLoading = false;
        this.lstSchedulerTiming = data as Array<any>;
        this.fetchTiming();
      },
      error => {
        this.getSchedulerTimingError(error);
        this.isLoading = false;
      }
    );
  }

  getSchedulerTimingError(error) {
    this.logMessage.log("getSchedulerTiming Error.");
  }



  fetchTiming() {

    debugger;

    this.appointmentForm.get("cmbStartTiming").setValue('');
    this.appointmentForm.get("cmbEndTiming").setValue('');

    this.isDayOff = false;
    this.isTimingNotAvailable = false;
    this.isTempTimingApplied = false;
    this.lstStartTiming = [];
    this.lstEndTiming = [];
    this.lstDuration = [];

    if (this.lstSchedulerTiming != undefined && this.lstSchedulerTiming.length > 0) {
      this.slot_size = this.lstSchedulerTiming[0].slot_size;
      this.isTempTimingApplied = this.lstSchedulerTiming[0].is_temp_applied;

      if (this.lstSchedulerTiming[0].timing === "DAY_OFF") {
        this.isDayOff = true;
      }
      else if (this.lstSchedulerTiming[0].timing === "TIMING_NOT_AVILABLE") {
        this.isTimingNotAvailable = true;
      }
    }
    else {
      this.slot_size = 15;
    }


    // Check if Current Appointmen time is available in provider timing.
    // if not then add only in case of modification
    let time_exist: boolean = false;
    if (this.appointmentId != undefined) {

      for (let t of this.lstSchedulerTiming) {
        if (this.appTime === t.timing) {
          time_exist = true;
          break;
        }
      }
    }

    let index: number = 0;
    let timeAdded: boolean = false;
    for (let t of this.lstSchedulerTiming) {

      timeAdded = false;

      if (t.timing === "BREAK_TIME" || t.timing === "DAY_OFF" || t.timing === "TIMING_NOT_AVILABLE")
        continue;

      // fetch timging in timing list if not exist incase of modification only onLoad.
      if (this.appointmentId != undefined && time_exist == false && this.isInitialLoading) {

        let timeToInsert: Date = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + this.appTime, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
        let timeToCompare: Date;

        timeToCompare = this.dateTimeUtil.getDateTimeFromString(this.selectedDate + ' ' + t.timing, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);

        if (timeToCompare > timeToInsert) {
          this.lstSchedulerTiming.splice(index, 0, { id: 1, timing: this.appTime, slot_size: this.slot_size, is_temp_applied: false, info: '' });
          this.lstStartTiming.push({ id: 1, timing: this.appTime, slot_size: this.slot_size, is_temp_applied: false, info: '' });
          timeAdded = true;
          time_exist = true;
        }
      }

      if (!timeAdded) {
        this.lstStartTiming.push(t);
      }
      index++;
    }

    debugger;
    if (time_exist || this.appointmentId == undefined) {
      this.appointmentForm.get("cmbStartTiming").setValue(this.appTime);
      this.populateEndTimeList(this.appTime);
      this.populateDurationList(this.appTime);
    }

    this.isInitialLoading = false;
  }


  onDateChange(dtNew): void {
    debugger;
    this.selectedDate = String("00" + dtNew.month).slice(-2) + '/' + String("00" + dtNew.day).slice(-2) + '/' + String("0000" + dtNew.year).slice(-4);
    this.getSchedulerTiming();
  }


  onTabChange(event: NgbTabChangeEvent) {
    debugger;

    switch (event.nextId) {
      case 'tab-patient':
        this.isPatientAppointment = true;
        this.isBlockTime = false;
        break;
      case 'tab-block':
        this.isBlockTime = true;
        this.isPatientAppointment = false;
        break;
      default:
        break;
    }

    this.appointmentForm.reset();
  }

  onStartTimingChanged(startTime) {
    this.populateEndTimeList(startTime);
    this.populateDurationList(startTime);
  }

  populateEndTimeList(startTime) {

    this.lstEndTiming = [];
    let insert: boolean = false;
    for (let t of this.lstStartTiming) {

      if (t.timing == startTime)
        insert = true;

      if (insert) {
        this.lstEndTiming.push(t);
      }
    }

    /*
    if(startEndLastValue!=undefined)
    {
      //Upto the End of Slot... add time
      let dt1: Date = this.dateTimeUtil.getDateTimeFromstring(this.selectedDate+ ' ' + startEndLastValue, DateTimeFormat.DATEFORMAT_MM_DD_YYYY_hh_mm_a);
      let dtEndUpTo:Date = this.dateTimeUtil.addDateTime(dt1, this.slot_size,DatePart.MINUTES);
      this.lstEndTiming.push({id:100,timing:this.dateTimeUtil.getDateTimeFormatedstring(dtEndUpTo, DateTimeFormat.DATEFORMAT_hh_mm_a),slot_size:this.slot_size,is_temp_applied:undefined,info:undefined});
    
      this.appointmentForm.get("cmbEndTiming").setValue(this.lstEndTiming[0].timing);
    }
    */

    if (this.lstEndTiming != undefined && this.lstEndTiming.length > 0) {
      this.appointmentForm.get("cmbEndTiming").setValue(this.lstEndTiming[0].timing);
    }

  }

  populateDurationList(startTime) {

    this.lstDuration = [];
    let insert: boolean = false;
    let i: number = 1;
    for (let t of this.lstStartTiming) {

      if (t.timing == startTime)
        insert = true;

      if (insert) {
        this.lstDuration.push(this.slot_size * i);
        i++;
      }
    }
  }

  validateFormData(formData: any): boolean {

    debugger;
    let isValid: boolean = true;
    this.lstErrors = [];

    if (formData.txtPatientIdHidden == undefined || formData.txtPatientIdHidden == '') {
      isValid = false;
      this.lstErrors.push("Please select Patient.");
    }

    if (formData.cmbLocation == undefined || formData.cmbLocation == '') {
      isValid = false;
      this.lstErrors.push("Please select Location");
    }
    if (formData.cmbProvider == undefined || formData.cmbProvider == '') {
      isValid = false;
      this.lstErrors.push("Please select Provider.");
    }

    if (formData.entryOption == 'appointment') {
      if (formData.dpAppDate == undefined || formData.dpAppDate == '') {
        isValid = false;
        this.lstErrors.push("Please select Appointment Date.");
      }
      else if (!this.dateTimeUtil.isValidDateTime(formData.dpAppDate, DateTimeFormat.DATE_MODEL)) {
        isValid = false;
        this.lstErrors.push("Appointment Date is not in correct format.");
      }

      if (formData.cmbStartTiming == undefined || formData.cmbStartTiming == '') {
        isValid = false;
        this.lstErrors.push("Please select Appointment Time.");
      }


      debugger;
      if (formData.cmbDuration == null || formData.cmbDuration == undefined || formData.cmbDuration == '') {
        isValid = false;
        this.lstErrors.push("Please select Appointment Duration.");
      }
      if (formData.cmbStatus == undefined || formData.cmbStatus == '') {
        isValid = false;
        this.lstErrors.push("Please select Appointment Status.");
      }
    }
    if (formData.entryOption == 'block') {

      if (formData.dpAppDate == undefined || formData.dpAppDate == '') {
        isValid = false;
        this.lstErrors.push("Please select Block Date.");
      }
      else if (!this.dateTimeUtil.isValidDateTime(formData.dpAppDate, DateTimeFormat.DATE_MODEL)) {
        isValid = false;
        this.lstErrors.push("Block Date is not in correct format.");
      }

      if (formData.cmbBlockOption == "blocktime") {
        if (formData.cmbStartTiming == undefined || formData.cmbStartTiming == '') {
          isValid = false;
          this.lstErrors.push("Please select Block Start Time.");
        }

        if (formData.cmbEndTiming == undefined || formData.cmbEndTiming == '') {
          isValid = false;
          this.lstErrors.push("Please select Block End Time.");
        }
      }
    }

    return isValid;
  }

  saveObjectWrapper: WrapperObjectSave;
  onSubmit(formData: any) {

    if (!this.validateFormData(formData)) {
      return;
    }
    this.loadingMsg = "Saving"
    this.isLoading = true;
    debugger;
    this.saveObjectWrapper = new WrapperObjectSave();

    let ormSaveAppointment: ORMSaveAppointment = new ORMSaveAppointment();

    ormSaveAppointment.appointment_id = this.appointmentId;
    ormSaveAppointment.practice_id = this.lookupList.practiceInfo.practiceId;
    ormSaveAppointment.appointment_date = this.selectedDate;
    ormSaveAppointment.provider_id = this.providerId;
    ormSaveAppointment.location_id = this.locationId;
    ormSaveAppointment.appointment_comments = formData.txtComments;
    ormSaveAppointment.modified_user = this.lookupList.logedInUser.user_name;
    ormSaveAppointment.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    ormSaveAppointment.appsource = 1;

    ormSaveAppointment.system_ip = this.lookupList.logedInUser.systemIp;

    if (this.appointmentId == undefined) {
      ormSaveAppointment.created_user = this.lookupList.logedInUser.user_name;
      ormSaveAppointment.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else {
      ormSaveAppointment.date_created = this.objAppDetails.date_created;
      ormSaveAppointment.created_user = this.objAppDetails.created_user;
      ormSaveAppointment.client_date_created = this.objAppDetails.client_date_created;
    }

    if (formData.entryOption === "block") {
      // calculate duration in case of block.
      debugger;
      if (formData.cmbBlockOption == "blockwholeday") {

        ormSaveAppointment.appointment_time = this.lstStartTiming[0].timing;
        ormSaveAppointment.appointment_duration = this.lstStartTiming.length * this.slot_size;

      }
      else if (formData.cmbBlockOption == "blocktime") {
        ormSaveAppointment.appointment_time = formData.cmbStartTiming;

        let bockSlotCount: number = 0;
        for (let t of this.lstEndTiming) {

          bockSlotCount++;

          if (t.timing == formData.cmbEndTiming)
            break;
        }
        ormSaveAppointment.appointment_duration = bockSlotCount * this.slot_size;
      }

      ormSaveAppointment.apptype = 1;// BLOCKED;
      ormSaveAppointment.patient_id = -1;
    }
    else {
      ormSaveAppointment.patient_id = this.patientId;
      ormSaveAppointment.appointment_duration = formData.cmbDuration;

      if (formData.cmbStatus != undefined) {
        ormSaveAppointment.status_id = formData.cmbStatus;
      }
      else {
        ormSaveAppointment.status_id = null;
      }
      if (formData.cmbType != undefined) {
        ormSaveAppointment.apptype = formData.cmbType;
      }
      else {
        ormSaveAppointment.apptype = null;
      }
      if (formData.cmbVisitReason != undefined) {
        ormSaveAppointment.appreason = formData.cmbVisitReason;
      }
      else {
        ormSaveAppointment.appreason = null
      }
      ormSaveAppointment.appointment_time = formData.cmbStartTiming;
    }

    this.saveObjectWrapper.ormSave = ormSaveAppointment;

    //appointmentSaveObjectWrapper.saveConfirmationList=[];
    //appointmentSaveObjectWrapper.saveConfirmationList.push(new ORMKeyValue("allow_duplicate","YES"));
    //appointmentSaveObjectWrapper.saveConfirmationList.push(new ORMKeyValue("update_encouter_PL","YES"));

    this.saveAppointment();

  }

  private saveAppointment() {
    this.schedulerService.saveAppointments(this.saveObjectWrapper).subscribe(
      data => {
        this.getsaveAppointmentSuccess(data);
        this.isLoading = false;
        this.loadingMsg = "Loading";

      },
      error => {
        this.getsaveAppointmentError(error);
        this.isLoading = false;
        this.loadingMsg = "Loading";
      }
    );
  }

  closePopup(value) {
    this.activeModal.close(value);
  }

  show: boolean = true;
  getsaveAppointmentSuccess(data) {

    debugger;
    let msg: string = "";

    if (data.status === ServiceResponseStatusEnum.NOT_ALLOWED) {
      //alert("Not Allowed\n" + data.response);

      let isBlocked: boolean = false;
      let isTimeNotAvailable: boolean = false;
      let isSlotLimitCompleted: boolean = false;
      let isEncounterDateMismatched: boolean = false;
      if (data.response_list != undefined && data.response_list.length > 0) {

        for (let r of data.response_list) {

          if (r.key == "timing_blocked") {
            isBlocked = true;
          }
          else if (r.key == "timing_available") {
            isTimeNotAvailable = true;
          }
          else if (r.key == "slot_limit_completed") {
            isSlotLimitCompleted = true;
          }
          else if (r.key == "encounter_date_mismatched") {
            isEncounterDateMismatched = true;
          }
        }
      }

      if (isTimeNotAvailable) {
        msg = "Provider timings are off for the selected time.";
      }
      else if (isBlocked) {
        if (this.patientId == -1)  // block time
        {
          msg = "Provider timing is already blocked.";
        }
        else {
          msg = "Provider timing is blocked.";
        }
      }
      else if (isSlotLimitCompleted) {
        msg = "Appointment can't be added because provider has reached the Maximum no of appointments at one slot.";
      }
      else if (isEncounterDateMismatched) {
        msg = "Appointment can't be modified, because Encounter exsist against this appointment.";
      }

      this.show = false;
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.alertType = AlertTypeEnum.WARNING;
      modalRef.componentInstance.promptMessage = msg;

      let closeResult;

      modalRef.result.then((result) => {
        this.show = true;

        //alert(result);
        if (result === PromptResponseEnum.OK) { }
      }
        , (reason) => {
          this.show = true;
          //alert(reason);
        });
    }

    else if (data.status === ServiceResponseStatusEnum.CONFIRMATION_REQUIRED) {
      // alert("Confirmation Required"+data.response);

      debugger;
      let isDuplicateAppointment: boolean = false;
      let isEncounterPLMismatched: boolean = false;
      let duplicateAppPL: string = "";

      if (data.response_list != undefined && data.response_list.length > 0) {

        for (let r of data.response_list) {

          if (r.key == "duplicate_appointment") {
            isDuplicateAppointment = true;
          }
          else if (r.key == "duplicate_appointment_PL") {
            duplicateAppPL = r.value;
          }

          else if (r.key == "encounter_PL_mismatched") {
            isEncounterPLMismatched = true;
          }
        }
      }

      if (isDuplicateAppointment) {
        msg = "Patient already has an appointment against " + duplicateAppPL + ". Do you want to create another appointment ? ";
      }
      else if (isEncounterPLMismatched) {
        msg = "Do you want to update the Appointment's Provider/Location at Encounter? ";
      }

      this.show = false;
      const modalRef = this.modalService.open(ConfirmationPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Confirmation Required"
      modalRef.componentInstance.promptMessage = msg;

      let closeResult;

      modalRef.result.then((result) => {
        this.show = true;

        //alert(result);
        if (result === PromptResponseEnum.YES) {
          this.saveObjectWrapper.lstKeyValue = [];
          if (isDuplicateAppointment) {
            this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("allow_duplicate", "YES"));
            this.saveAppointment();
          }

          if (isEncounterPLMismatched) {
            this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("update_encouter_PL", "YES"));
            this.saveAppointment();
          }
        }
        else if (result === PromptResponseEnum.NO) {

          //  isDuplicateAppointment 
          // No need to send request to server if duplicate not allowed.

          if (isEncounterPLMismatched) {
            this.saveObjectWrapper.lstKeyValue = [];
            this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("update_encouter_PL", "NO"));
            this.saveAppointment();
          }
        }
      }
        , (reason) => {
          this.show = true;
          //alert(reason);
        });

    }

    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      alert("Error" + data.response);
    }

    else if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      //alert("Success"+data.response);
      this.activeModal.close(true);
    }

  }

  getsaveAppointmentError(error) {
    debugger;
    this.logMessage.log("saveAppointmentError Error.");
  }

  onOptionChange(event) {

    if (event == "appointment") {
      this.patientName = undefined;
      this.patientId = undefined;
      this.appointmentForm.get("txtPatientSearch").setValue(null);
      this.appointmentForm.get("txtPatientIdHidden").setValue(null);
    }
    else if (event == "block") {
      this.patientName = undefined;
      this.patientId = -1;
      this.appointmentForm.get("txtPatientSearch").setValue(null);
      this.appointmentForm.get("txtPatientIdHidden").setValue(-1);

    }
    //this.appointmentForm.reset();
  }

  clearPatient() {
    this.patientName = undefined;
    this.patientId = undefined;
    this.appointmentForm.get("txtPatientSearch").setValue(null);
    this.appointmentForm.get("txtPatientIdHidden").setValue(null);
  }

  patPicErrorHandler(event) {
    event.target.src = this.lookupList.defaultPatPic;;
  }

  OnCreatePatient() {
    debugger;
    this.addPatient.emit();
    this.closePopup(false);
  }

  UIBlockerKeyDown(e: KeyboardEvent) {

    debugger;
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();


  }

  onDateFocusOut(date: string) {
    let formatedDate = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined && formatedDate != '') {
      this.appointmentForm.get('dpAppDate').setValue(formatedDate);
    }
  }

  onTypeChanged(value) {

    debugger;
    let isFound: boolean = false;
    let duration;
    const objType = this.generalOperation.getitem(this.lookupList.appTypesList, 'id', value);
    if (objType != undefined && objType.duration != undefined && objType.duration > 0) {

      duration = objType.duration;
      if (this.lstDuration != undefined && this.lstDuration.length > 0) {

        for (let i: number = 0; i < this.lstDuration.length; i++) {
          if (this.lstDuration[i] == duration) {
            isFound = true;
            break;
          }
        }

        if (!isFound) {
          duration = this.lstDuration[0];
          isFound = true;
        }
      }
    }

    if (isFound) {
      this.appointmentForm.get('cmbDuration').setValue(duration);
    }
    else {
      this.appointmentForm.get('cmbDuration').setValue(null);
      this.appointmentForm.get("cmbDuration").reset();
    }

  }
}
