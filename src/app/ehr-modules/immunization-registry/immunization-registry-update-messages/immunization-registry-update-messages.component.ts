import { Component, OnInit, Inject } from '@angular/core';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { ImmunizationService } from 'src/app/services/immunization.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PromptResponseEnum, AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { DateModel } from 'src/app/models/general/date-model';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { CustomValidators, datetimeValidator } from 'src/app/shared/custome-validators';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { UpdateRecordModel } from 'src/app/models/general/update-record-model';

@Component({
  selector: 'immunization-registry-update-messages',
  templateUrl: './immunization-registry-update-messages.component.html',
  styleUrls: ['./immunization-registry-update-messages.component.css']
})
export class ImmunizationRegistryUpdateMessagesComponent implements OnInit {

  searchFormGroup: FormGroup;
  loadingCount: number = 0;
  isLoading: boolean = false;
  showPatientSearch: boolean = false;
  patientIdSearch: number;
  patientNameSearch: number;



  lstRegMessages: Array<any>;
  lstRegMessagesErrors: Array<any>;
  lstRegMessagesImmunizations: Array<any>;

  lstMsgErrors: Array<any>;
  lstMsgWarnings: Array<any>;
  lstMsgInfo: Array<any>;
  selectedMessageId: number;

  messageStatusCode: string = "";

  regMessagesCount: number = 0;

  lstStatus: Array<any> = [
    { code: "AQ", description: "Message Queued" },
    { code: "AT", description: "Message Transmitted" },
    { code: "AA", description: "Successful" },
    { code: "ERROR", description: "Error" },
    { code: "RESOLVED", description: "Resolved" }
  ]
  dateType: string = "message_date";
  currentDateModel: DateModel;
  selectedClinicId: string = "";
  registryCode: string = "";


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
      dateType: this.formBuilder.control(this.dateType, Validators.required),
      dpFrom: this.formBuilder.control(this.currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      dpTo: this.formBuilder.control(this.currentDateModel, Validators.compose([
        Validators.required,
        datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
      ])),
      ddStatus: this.formBuilder.control("AQ"),
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

  onDateTypeChange(type: string) {
    this.dateType = type;
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
      strErrorMsg = this.dateTimeUtil.validateDateFromDateTo(serachFormValues.dpFrom, serachFormValues.dpTo, DateTimeFormat.DATE_MODEL, false, true);
    }


    if (strErrorMsg !== "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Messages', strErrorMsg, AlertTypeEnum.WARNING)

      return false;
    }
    else {
      return true;
    }

  }
  searchCriteria: SearchCriteria = new SearchCriteria();
  onSearchSubmit(serachFormValues: any) {

    this.regMessagesCount = 0;
    this.lstRegMessagesErrors = undefined;
    this.lstRegMessagesImmunizations = undefined;
    this.lstMsgErrors = undefined;
    this.lstMsgWarnings = undefined;
    this.lstMsgInfo = undefined;

    if (!this.validateSearch(serachFormValues)) {
      return;
    }


    debugger;
    this.searchCriteria = new SearchCriteria();
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.option = "VXU";// Message Type
    this.searchCriteria.param_list = [
      { name: "registry_code", value: this.registryCode, option: "" },
      { name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(serachFormValues.dpFrom), option: serachFormValues.dateType },
      { name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(serachFormValues.dpTo), option: serachFormValues.dateType },
    ];

    if (this.selectedClinicId != undefined || this.selectedClinicId != null) {
      this.searchCriteria.param_list.push({ name: "clinic_id", value: this.selectedClinicId, option: "" });
    }
    if (this.patientIdSearch != undefined || this.patientIdSearch != null) {
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientIdSearch, option: "" });
    }
    if (serachFormValues.ddStatus != undefined || serachFormValues.ddStatus != "") {
      this.searchCriteria.param_list.push({ name: "status_code", value: serachFormValues.ddStatus, option: "" });
    }

    this.getImmRegMessages();
  }

  getImmRegMessages() {
    this.isLoading = true;
    this.immService.getImmRegMessages(this.searchCriteria).subscribe(
      data => {

        this.lstRegMessages = data as Array<any>;
        this.regMessagesCount = 0;
        this.isLoading = false;

        if (this.lstRegMessages != undefined && this.lstRegMessages.length > 0) {

          this.regMessagesCount = this.lstRegMessages.length;
          this.selectionChanged(this.lstRegMessages[0]);
          //this.selectedMessageId = this.lstRegMessages[0].message_id;
          //this.loadMessageDetails();


        }
        //else {
        //  this.regMessagesCount = 0;
        //  this.isLoading = false;
        //}
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

  getImmRegMsgImmunizations() {

    this.immService.getImmRegMsgImmunizations(this.selectedMessageId).subscribe(
      data => {

        this.lstRegMessagesImmunizations = data as Array<any>;


        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getImmRegMsgImmunizationsError(error);
      }
    );
  }
  getImmRegMsgImmunizationsError(error: any) {
    this.logMessage.log("getImmRegMsgImmunizations Error." + error);
  }
  getImmRegMsgErrorList() {

    this.immService.getImmRegMsgErrors(this.selectedMessageId).subscribe(
      data => {

        this.lstRegMessagesErrors = data as Array<any>;


        if (this.lstRegMessagesErrors != undefined && this.lstRegMessagesErrors.length > 0) {
          this.lstRegMessagesErrors.forEach(error => {

            switch (error.severity) {
              case "E":
                if (this.lstMsgErrors == undefined) {
                  this.lstMsgErrors = new Array<any>();
                }
                this.lstMsgErrors.push(error);
                break;
              case "W":
                if (this.lstMsgWarnings == undefined) {
                  this.lstMsgWarnings = new Array<any>();
                }
                this.lstMsgWarnings.push(error);
                break;
              case "I":
                if (this.lstMsgInfo == undefined) {
                  this.lstMsgInfo = new Array<any>();
                }
                this.lstMsgInfo.push(error);
                break;

              default:
                break;
            }

          });
        }


        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isLoading = false;
        }
      },
      error => {
        this.isLoading = false;
        this.getImmRegMsgErrorListError(error);
      }
    );
  }
  getImmRegMsgErrorListError(error: any) {
    this.logMessage.log("getImmRegMsgErrorList Error." + error);
  }



  loadMessageDetails() {

    this.lstRegMessagesErrors = undefined;
    this.lstRegMessagesImmunizations = undefined;
    this.lstMsgErrors = undefined;
    this.lstMsgWarnings = undefined;
    this.lstMsgInfo = undefined;

    this.loadingCount = 2;
    this.isLoading = true;
    this.getImmRegMsgImmunizations();
    this.getImmRegMsgErrorList();
  }


  openPatient(data: any) {
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id.toString();
    obj.patient_name = data.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }

  selectionChanged(msg: any) {
    if (this.selectedMessageId != msg.message_id) {
      this.messageStatusCode = msg.message_status;
      this.selectedMessageId = msg.message_id;
      this.loadMessageDetails();
    }
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
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Update Message', data.response, AlertTypeEnum.INFO)
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Update Message', data.response, AlertTypeEnum.DANGER)
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
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Update Message', data.response, AlertTypeEnum.INFO)
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Update Message', data.response, AlertTypeEnum.DANGER)
    }
  }


  processAcknowledgementMessageFromDirectoryError(error: any) {
    debugger;
    this.logMessage.log("processAcknowledgementMessageFromDirectory Error." + error);
  }


  markAsResolved(msgId: number) {


    let updateRecordModel: UpdateRecordModel = new UpdateRecordModel();
    updateRecordModel.id = msgId;
    updateRecordModel.client_ip = this.lookupList.logedInUser.systemIp;
    updateRecordModel.user_name = this.lookupList.logedInUser.user_name;

    this.immService.markRegistryMessageAsResolved(updateRecordModel).subscribe(
      data => {
        this.markAsResolvedSuccess(data);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.markAsResolvedError(error);
      }
    );
  }

  markAsResolvedSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      // GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Update Message', data.response, AlertTypeEnum.INFO)
      this.getImmRegMessages();
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Immunization Registry Update Message', data.response, AlertTypeEnum.DANGER)
    }
  }


  markAsResolvedError(error: any) {
    debugger;
    this.logMessage.log("markAsResolvedError Error." + error);
  }


}
