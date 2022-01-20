import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DateModel } from 'src/app/models/general/date-model';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { CustomValidators, datetimeValidator } from 'src/app/shared/custome-validators';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GenerateImmRegHistoryForecastQueryMessageComponent } from '../generate-imm-reg-history-forecast-query-message/generate-imm-reg-history-forecast-query-message.component';

@Component({
  selector: 'immunization-registry-history-forecast-messages',
  templateUrl: './immunization-registry-history-forecast-messages.component.html',
  styleUrls: ['./immunization-registry-history-forecast-messages.component.css']
})
export class ImmunizationRegistryHistoryForecastMessagesComponent implements OnInit {

  searchFormGroup: FormGroup;
  loadingCount: number = 0;
  isLoading: boolean = false;
  showPatientSearch: boolean = false;
  patientIdSearch: number;
  patientNameSearch: number;

  registryCode: string = "";

  lstRegMessages: Array<any>;

  lstEvaluatedHistory: Array<any>;
  lstForecast: Array<any>;

  //lstRegMessagesErrors: Array<any>;
  //lstRegMessagesImmunizations: Array<any>;



  //lstMsgErrors: Array<any>;
  //lstMsgWarnings: Array<any>;
  //lstMsgInfo: Array<any>;
  selectedMessageId: number;
  selectedMessagePatientId: number;


  messageStatusCode: string = "";
  patientInfoNotes: string;

  patientInfo: any;
  scheduleUsed: string;
  //reqRespMsg: string;
  reqResponse:string;

  regMessagesCount: number = 0;


  //dateType: string = "message_date";
  currentDateModel: DateModel;
  selectedClinicId: string;


  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private formBuilder: FormBuilder,
    private immService: ImmunizationService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private openModuleService: OpenModuleService,
    private dateTimeUtil: DateTimeUtil) { }

  ngOnInit() {

    debugger;
    this.currentDateModel = this.dateTimeUtil.getCurrentDateModel();

    if (this.lookupList.lstImmRegClinics == undefined || this.lookupList.lstImmRegClinics.length == 0) {
      this.isLoading = true;
      this.getImmRegistryClinics();
    }
    else if (this.lookupList.lstImmRegClinics.length == 1) {
      this.selectedClinicId = this.lookupList.lstImmRegClinics[0].clinic_id;
      this.registryCode = this.lookupList.lstImmRegClinics[0].registry_code;
    }

    this.buildForm();

  }

  buildForm() {

    this.searchFormGroup = this.formBuilder.group({
      ddClinic: this.formBuilder.control(this.selectedClinicId, Validators.required),
      //dateType: this.formBuilder.control(this.dateType, Validators.required),
      dpFrom: this.formBuilder.control(this.currentDateModel, Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpTo: this.formBuilder.control(this.currentDateModel, Validators.compose([        
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      //ddStatus: this.formBuilder.control("AQ"),
      txtPatientIdHidden: this.formBuilder.control(null),
      txtPatientSearch: this.formBuilder.control(null)
    }
    /*,
      {
        validator: Validators.compose([
          CustomValidators.validDate("dpFrom", false),
          CustomValidators.validDate("dpTo", false)
        ])
      }
      */
    );
  }
  getImmRegistryClinics() {
    this.immService.getRegistryClinics(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        this.lookupList.lstImmRegClinics = data as Array<any>;

        debugger;
        if (this.lookupList.lstImmRegClinics.length == 1) {
          this.selectedClinicId = this.lookupList.lstImmRegClinics[0].clinic_id;
          this.registryCode = this.lookupList.lstImmRegClinics[0].registry_code;
          this.searchFormGroup.get("ddClinic").setValue(this.selectedClinicId);
        }

        //this.loadingCount--;
        //if (this.loadingCount == 0) {
        this.isLoading = false;
        //}
      },
      error => {

        this.isLoading = false;
        this.getImmRegistryClinicsError(error);
      }
    );
  }
  getImmRegistryClinicsError(error: any) {
    this.logMessage.log("getImmRegistryClinics Error." + error);
  }

  clinicChanged(clinicId: string) {


    this.selectedClinicId = undefined;


    if (clinicId != null && clinicId != undefined && clinicId != "" && clinicId != "Select Clinic") {
      this.selectedClinicId = clinicId;
    }
  }



  onPatientSearchKeydown(event: any) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else {
      this.showPatientSearch = false;
    }
  }
  onPatientSearchInputChange(newValue) {
    if (newValue !== this.patientNameSearch) {

      this.patientIdSearch = undefined;
      this.searchFormGroup.get("txtPatientIdHidden").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchBlur() {
    //this.logMessage.log("onPatientSearchBlur");

    if (this.patientIdSearch == undefined && this.showPatientSearch == false) {
      this.patientNameSearch = undefined;
      this.searchFormGroup.get("txtPatientSearch").setValue(null);
      this.searchFormGroup.get("txtPatientIdHidden").setValue(null);
    }
    //this.patientId=undefined;
  }
  openSelectPatient(patObject) {

    this.patientIdSearch = patObject.patient_id;
    this.patientNameSearch = patObject.name;

    (this.searchFormGroup.get('txtPatientIdHidden') as FormControl).setValue(this.patientIdSearch);
    (this.searchFormGroup.get('txtPatientSearch') as FormControl).setValue(this.patientNameSearch);

    this.showPatientSearch = false;

  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }

  validateSearch(serachFormValues: any): boolean {


    let strErrorMsg: string = "";

    if (serachFormValues.ddClinic == undefined || serachFormValues.ddClinic == "") {
      strErrorMsg = "Please select Clinic.";
    }
    else if (serachFormValues.dpFrom == undefined || serachFormValues.dpFrom == "") {
      strErrorMsg = "Please select Date From.";
    }
    else if (serachFormValues.dpTo == undefined || serachFormValues.dpTo == "") {
      strErrorMsg = "Please select Date To.";
    }
    else {
      strErrorMsg = this.dateTimeUtil.validateDateFromDateTo(serachFormValues.dpFrom, serachFormValues.dpTo, DateTimeFormat.DATE_MODEL,false, true);
    }


    if (strErrorMsg !== "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Messages', strErrorMsg, AlertTypeEnum.WARNING)

      return false;
    }
    else {
      return true;
    }

  }

  onSearchSubmit(serachFormValues: any) {

    this.regMessagesCount = 0;
    this.lstRegMessages = undefined;
    this.patientInfo = undefined;
    this.scheduleUsed = undefined;
    this.reqResponse = undefined;

    if (!this.validateSearch(serachFormValues)) {
      return;
    }


    debugger;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.option = "QBP"; // Message Type
    searchCriteria.param_list = [
      { name: "registry_code", value: this.registryCode, option: "" },
      { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(serachFormValues.dpFrom), option: "" },
      { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(serachFormValues.dpTo), option: "" },
    ];

    if (this.selectedClinicId != undefined || this.selectedClinicId != null) {
      searchCriteria.param_list.push({ name: "clinic_id", value: this.selectedClinicId, option: "" });
    }
    if (this.patientIdSearch != undefined || this.patientIdSearch != null) {
      searchCriteria.param_list.push({ name: "patient_id", value: this.patientIdSearch, option: "" });
    }

    this.isLoading = true;
    this.immService.getImmRegMessages(searchCriteria).subscribe(
      data => {

        this.lstRegMessages = data as Array<any>;


        if (this.lstRegMessages != undefined && this.lstRegMessages.length > 0) {
          this.regMessagesCount = this.lstRegMessages.length;
          this.selectedMessageId = this.lstRegMessages[0].message_id;
          this.messageStatusCode = this.lstRegMessages[0].message_status;
          this.selectedMessagePatientId = this.lstRegMessages[0].patient_id;
          this.loadMessageDetails();


        }
        else {
          this.regMessagesCount = 0;
          this.isLoading = false;
        }
      },
      error => {

        this.isLoading = false;
        this.getImmRegMessagesError(error);
      }
    );
  }
  getImmRegMessagesError(error: any) {
    this.logMessage.log("getImmRegMessages Error." + error);
  }


  openPatient(data: any) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id.toString();
    obj.patient_name = data.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }

  selectionChanged(msg: any) {



    if (this.selectedMessageId != msg.message_id) {
      this.patientInfoNotes = undefined;
      this.scheduleUsed = undefined;
      this.reqResponse = undefined;
      this.messageStatusCode = msg.message_status;
      this.selectedMessageId = msg.message_id;
      this.selectedMessagePatientId = msg.patient_id;
      //if (msg.message_status == "AQ") {
      //  this.patientInfoNotes = "Patient Info is derived from EHR Patient Record.";
      //}

      this.loadMessageDetails();
    }
  }

  loadMessageDetails() {

    this.loadingCount = 1;
    this.isLoading = true;
    //if (this.messageStatusCode == "AQ") {
    //this.getImmRegPatientInfo(this.selectedMessagePatientId);
    //}

    this.getImmRegEvaluationHistoryForecastMessageDetails();
  }


  getImmRegEvaluationHistoryForecastMessageDetails() {

    debugger;
    
    this.patientInfo = undefined;
    this.patientInfoNotes = undefined;
    this.scheduleUsed = undefined;
    this.reqResponse = undefined;

    this.lstEvaluatedHistory = undefined;
    this.lstForecast = undefined;



    this.immService.getImmRegEvaluationHistoryForecastMessageDetails(this.registryCode, this.selectedMessageId).subscribe(
      data => {

        debugger;
        this.patientInfo = (data as any).patient_info;
        this.patientInfoNotes = (data as any).patient_info_notes;
        this.scheduleUsed = (data as any).schedule_used;
        this.reqResponse = (data as any).req_response;

        this.lstEvaluatedHistory = (data as any).lst_evaluated_history as Array<any>;
        this.lstForecast = (data as any).lst_forecast as Array<any>;

        this.isLoading = false;
      },
      error => {

        this.isLoading = false;
        this.getImmRegEvaluationHistoryForecastMessageDetailsError(error);
      }
    );
  }


  getImmRegEvaluationHistoryForecastMessageDetailsError(error: any) {
    this.logMessage.log("getImmRegEvaluationHistoryForecastMessageDetails Error." + error);
  }

  generateQBPMessage() {

    const modalRef = this.ngbModal.open(GenerateImmRegHistoryForecastQueryMessageComponent, this.popUpOptions);

    modalRef.result.then((result) => {

      if (result) {

        this.onSearchSubmit(this.searchFormGroup.value);
        //this.getViewData();
        //this.onRadioOptionChange(this.dataOption);
      }
    }, (reason) => {

      //this.getViewData();
      //this.clearRegistrySelectedData();

    });
  }


  responseFile: File;
  onResponseFileChange(event: any) {
    this.responseFile = undefined;
    let reader = new FileReader();

    if (event.target.files && event.target.files.length > 0) {
      this.responseFile = event.target.files[0];

      if (event.target.files && event.target.files[0]) {

        reader.onload = (event) => {
          this.processAcknowledgementMessageFromFileData();
        }
        reader.readAsBinaryString(event.target.files[0]);
      }

    }


  }

  processAcknowledgementMessageFromFileData() {

    debugger;
    const formDate: FormData = new FormData();
    formDate.append('response_file', this.responseFile);

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "registry_code", value: this.registryCode, option: "" },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" }
    ];

    formDate.append('criteria_data', JSON.stringify(searchCriteria));

    this.immService.processAcknowledgementMessageFromFileData(formDate).subscribe(
      data => {
        this.processAcknowledgementMessageFromFileDataSuccess(data);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.processAcknowledgementMessageFromFileDataError(error);
      }
    );
  }


  processAcknowledgementMessageFromFileDataSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'History and Forecast Message', data.response, AlertTypeEnum.INFO)
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'History and Forecast Message', data.response, AlertTypeEnum.DANGER)
    }
  }


  processAcknowledgementMessageFromFileDataError(error: any) {
    debugger;
    this.logMessage.log("processAcknowledgementMessageFromFileData Error." + error);
  }



  processAcknowledgementMessageFromDirectory() {


    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "registry_code", value: this.registryCode, option: "" },
      { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" }
    ];


    this.immService.processAcknowledgementMessageFromDirectory(searchCriteria).subscribe(
      data => {
        this.processAcknowledgementMessageFromDirectorySuccess(data);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.processAcknowledgementMessageFromDirectoryError(error);
      }
    );
  }


  processAcknowledgementMessageFromDirectorySuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'History and Forecast Message', data.response, AlertTypeEnum.INFO)
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'History and Forecast Message', data.response, AlertTypeEnum.DANGER)
    }
  }


  processAcknowledgementMessageFromDirectoryError(error: any) {
    debugger;
    this.logMessage.log("processAcknowledgementMessageFromDirectory Error." + error);
  }

}