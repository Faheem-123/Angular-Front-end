import { WrapperObjectSave } from './../../../../models/general/wrapper-object-save';
import { GeneralOperation } from './../../../../shared/generalOperation';
import { PatientSubTabsEnum, CallingFromEnum, PromptResponseEnum } from './../../../../shared/enum-util';
import { ConfirmationPopupComponent } from './../../../../general-modules/confirmation-popup/confirmation-popup.component';
import { DateTimeFormat } from './../../../../shared/date-time-util';
import { ORMPatientReferral } from './../../../../models/patient/orm-patient-referral';
import { LOOKUP_LIST, LookupList } from './../../../../providers/lookupList.module';
import { LogMessage } from './../../../../shared/log-message';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { ReferralService } from '../../../../services/patient/referral.service';
import { SearchCriteria } from '../../../../models/common/search-criteria';
import { FormGroup, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DateTimeUtil } from '../../../../shared/date-time-util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ORMDeleteRecord } from '../../../../models/general/orm-delete-record';
import { ORMReferralStaffNotes } from '../../../../models/patient/orm-referral-staff-notes';
import { ORMKeyValue } from '../../../../models/general/orm-key-value';
import { ImportIcdComponent } from 'src/app/ehr-modules/encounter/lab/import-icd/import-icd.component';
import { SearchService } from 'src/app/services/search.service';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { ProviderAuthenticationPopupComponent } from 'src/app/general-modules/provider-authentication-popup/provider-authentication-popup.component';
import { identifierModuleUrl } from '@angular/compiler';
import { datetimeValidator } from 'src/app/shared/custome-validators';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { OpenModuleService } from 'src/app/services/general/openModule.service';

@Component({
  selector: 'patient-referral-request',
  templateUrl: './patient-referral-request.component.html',
  styleUrls: ['./patient-referral-request.component.css']
})
export class PatientReferralRequestComponent implements OnInit {

  @Input() patient: PatientToOpen;

  //@Input() patientId;

  lstReferralRequest;
  lstReferralSearch;
  lstConsultType;
  isLoading: boolean = false;
  isSaving: boolean = false;

  inputForm: FormGroup;
  statusForm: FormGroup;
  searchForm: FormGroup;
  status: string = '';
  signed_by: string = '';
  signed_by_view: string = '';
  notes: string = '';
  isReadonly = true;
  rowId;
  operation = '';
  selectedReferral;
  referral_id;
  patientNameRequest: string = ''
  patientIdRequest;
  public isSearchReferral = false;
  private obj_patient_referral: ORMPatientReferral;
  private obj_referralStaffNotes: ORMReferralStaffNotes;

  poupUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  refPhyName: string = '';
  refPhyAddress: string = '';
  refPhyPhone: string = '';
  refPhyFax: string = '';



  constructor(private referralService: ReferralService, private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private modalService: NgbModal,
    private generalOperation: GeneralOperation, private searchService: SearchService,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private openModuleService: OpenModuleService) { }

  buildForm() {
    debugger;

    if (this.patient == undefined) {
      this.searchForm = this.formBuilder.group({
        txtPatientSearchFrom: this.formBuilder.control(null),
        txtPatientIdHiddenSearchFrom: this.formBuilder.control(null),
        ddProviderSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultProvider == 0 ? '' : this.lookupList.logedInUser.defaultProvider),
        ddLocationSearch: this.formBuilder.control(this.lookupList.logedInUser.defaultLocation == 0 ? '' : this.lookupList.logedInUser.defaultLocation),

        ddConsultTypeSearch: this.formBuilder.control(null),
        ddStatusSearch: this.formBuilder.control(null),
        chkHighImpSearch: this.formBuilder.control(null),
        dateFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
          Validators.required,
          datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
        ])),
        dateTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel(), Validators.compose([
          Validators.required,
          datetimeValidator(DateTimeFormat.DATEFORMAT_MM_DD_YYYY)
        ])),
        chkOrderCross: this.formBuilder.control("")
      });
    }

    this.inputForm = this.formBuilder.group({
      drpProvider: this.formBuilder.control("", Validators.required),
      drpLocation: this.formBuilder.control("", Validators.required),
      drpConsultType: this.formBuilder.control("", Validators.required),
      txtReferTo: this.formBuilder.control("", Validators.required),
      txtProvider: this.formBuilder.control("", Validators.required),
      //txtReferAddress: this.formBuilder.control("", Validators.required),
      //txtReferphone: this.formBuilder.control("", Validators.required),
      //txtReferfax: this.formBuilder.control("", Validators.required),
      txtnotes: this.formBuilder.control("", Validators.required),
      txtComments: this.formBuilder.control("", Validators.required),
      txtPatientInput: this.formBuilder.control(this.patient != undefined ? this.patient.patient_name : '', Validators.required),
      txtPatientIdHiddenInput: this.formBuilder.control(this.patient != undefined ? this.patient.patient_id : '', Validators.required),
      chkImportance: this.formBuilder.control(false)

    })
    this.statusForm = this.formBuilder.group({
      drpStatus: this.formBuilder.control("", Validators.required),
      txtNotes: this.formBuilder.control("", Validators.required)
    })
  }

  ngOnInit() {
    this.isLoading = true;
    this.buildForm();
    this.EnableDisableDropDown(false);

    this.onGetConsultType();

    debugger;
    if (this.patient != undefined) {
      this.searchCriteria = new SearchCriteria();
      this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      this.searchCriteria.param_list = [
        { name: "patient_id", value: this.patient.patient_id }
        , { name: "referral_request", value: "1" }
      ];

      this.getReferral();
    }
  }


  getReferral() {
    /*
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId }
      , { name: "referral_request", value: "1" }
    ];
    */

    this.lstReferralRequest = undefined;
    this.isLoading = true;
    this.referralService.getPatientReferral(this.searchCriteria).subscribe(
      data => {
        debugger;
        this.isLoading = false;
        this.lstReferralRequest = data;
        if (this.lstReferralRequest.length > 0)
          this.OnSelectionChanged(this.lstReferralRequest[0]);
      },
      error => {
        this.isLoading = false;
      }
    );
  }



  onGetConsultType() {
    this.lstConsultType = undefined;
    this.isLoading = true;
    this.referralService.getConsultType(this.lookupList.practiceInfo.practiceId).subscribe(
      data => {

        debugger;
        this.isLoading = false;
        this.lstConsultType = data;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  OnSelectionChanged(request) {

    if (!this.isReadonly) {
      return;
    }

    this.signed_by = '';
    this.signed_by_view = '';
    this.rowId = request.referral_id;


    (this.inputForm.get('drpConsultType') as FormControl).setValue(request.consult_type_id);
    (this.inputForm.get('txtComments') as FormControl).setValue(request.referral_reason == null ? '' : request.referral_reason);

    //(this.inputForm.get('txtComments') as FormControl).setValue(request.date_created_mmddyy);
    (this.inputForm.get('drpProvider') as FormControl).setValue(request.provider_id);
    (this.inputForm.get('drpLocation') as FormControl).setValue(request.location_id);


    debugger;

    //(this.inputForm.get('txtReferAddress') as FormControl).setValue(request.referral_provider_address);
    //(this.inputForm.get('txtReferphone') as FormControl).setValue(request.referral_provider_phone);
    //(this.inputForm.get('txtReferfax') as FormControl).setValue(request.referral_provider_fax);
    (this.inputForm.get("chkImportance") as FormControl).setValue(request.high_importance);

    this.status = request.referral_status;
    this.refPhyName = request.referral_provider_name;
    this.refPhyAddress = request.referral_provider_address;
    this.refPhyPhone = request.referral_provider_phone;
    this.refPhyFax = request.referral_provider_fax;
    this.patientNameRequest = request.patient_name;
    this.patientIdRequest = request.patient_id;

    (this.inputForm.get('txtPatientIdHiddenInput') as FormControl).setValue(this.patientIdRequest);
    (this.inputForm.get('txtPatientInput') as FormControl).setValue(this.patientNameRequest);
    (this.inputForm.get('txtReferTo') as FormControl).setValue(this.refPhyName);

    if (request.fax_status != null && request.fax_status != "")
      this.status += " (" + request.fax_status + ")";

    this.signed_by = request.signed_by;
    this.signed_by_view = request.signed_by;
    if (request.date_signed != null && request.date_signed != "")
      this.signed_by_view += " at " + request.date_signed;


    this.notes = request.notes;
    //(this.inputForm.get('lblNotes') as FormControl).setValue(request.referral_reason);
    //(this.inputForm.get('txtComments') as FormControl).setValue(request.referral_status);


  }

  OnEdit(operation, referral) {
    this.isReadonly = false;
    this.EnableDisableDropDown(true);
    this.operation = 'Edit';
    this.selectedReferral = referral;
    this.referral_id = referral.referral_id;
  }

  onChange(value) {
    //console.log(value.value);
  }

  OnSave() {
    debugger;

    if (this.patientIdRequest == undefined || this.patientIdRequest == undefined) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select patient.", 'warning')
      return false;
    }

    this.isSaving = true;
    this.obj_patient_referral = new ORMPatientReferral();

    this.obj_patient_referral.patient_id = this.patientIdRequest;// this.patientId;
    this.obj_patient_referral.location_id = (this.inputForm.get('drpLocation') as FormControl).value;
    this.obj_patient_referral.provider_id = (this.inputForm.get('drpProvider') as FormControl).value;
    this.obj_patient_referral.consult_type_id = (this.inputForm.get('drpConsultType')).value;
    this.obj_patient_referral.referral_reason = (this.inputForm.get('txtComments')).value;

    if (this.referral_id != "") {
      this.obj_patient_referral.referral_provider_id = this.referral_id;
    }
    this.obj_patient_referral.referral_provider_name = this.refPhyName// (this.inputForm.get('txtReferTo')).value;
    this.obj_patient_referral.referral_provider_address = this.refPhyAddress;// (this.inputForm.get('txtReferAddress')).value;
    this.obj_patient_referral.referral_provider_fax = this.refPhyFax;// (this.inputForm.get('txtReferfax')).value;
    this.obj_patient_referral.referral_provider_phone = this.refPhyPhone;// (this.inputForm.get('txtReferphone')).value;
    this.obj_patient_referral.referral_status = "Pending";
    this.obj_patient_referral.client_date_modified = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
    this.obj_patient_referral.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_patient_referral.practice_id = this.lookupList.practiceInfo.practiceId;
    this.obj_patient_referral.referral_request = true;
    this.obj_patient_referral.high_importance = (this.inputForm.get('chkImportance')).value;
    this.obj_patient_referral.deleted = false;
    if (this.signed_by != null && this.signed_by != "") {
      this.obj_patient_referral.signed_by = this.signed_by;
      this.obj_patient_referral.date_signed = this.dateTimeUtil.getCurrentDateTimeString();
    }
    else if (this.operation != "New" && this.selectedReferral.signed_by != null && this.selectedReferral.signed_by != "") {
      this.obj_patient_referral.signed_by = this.selectedReferral.signed_by;
      this.obj_patient_referral.date_signed = this.selectedReferral.date_signed;
    }
    if (this.operation == "New") {
      this.obj_patient_referral.client_date_created = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
      this.obj_patient_referral.created_user = this.lookupList.logedInUser.user_name;
      this.obj_patient_referral.chart_id = undefined;
      this.obj_patient_referral.referral_id = undefined;
    }
    else {
      this.obj_patient_referral.referral_id = this.selectedReferral.referral_id;
      this.obj_patient_referral.client_date_created = this.selectedReferral.client_date_created;
      this.obj_patient_referral.created_user = this.selectedReferral.created_user;
      this.obj_patient_referral.date_created = this.selectedReferral.date_created;
      this.obj_patient_referral.chart_id = this.selectedReferral.chart_id;
    }

    this.referralService.savePatientReferralRequest(this.obj_patient_referral)
      .subscribe(
        data => {
          this.isSaving = false;
          this.savedSuccessfull(data)

        }
        ,
        error => alert(error),
        () => {
          this.isSaving = false;
          this.logMessage.log("Save Patient Referral Request.")
        }
      );
  }
  savedSuccessfull(data) {

    // if(this.operation=='New')
    // {
    //   debugger;
    //   data.date_created=this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_MM_DD_YYYY);
    //   this.lstReferralRequest.push(data);
    // }
    this.getReferral();
    this.selectedReferral = null;
    this.isReadonly = true;
    this.EnableDisableDropDown(false);
    this.operation = '';
  }
  OnCancel() {
    this.isReadonly = true;
    this.isSearchReferral = false;
    this.EnableDisableDropDown(false);
    this.operation = '';
    debugger;
    if (this.lstReferralRequest.length > 0)
      this.OnSelectionChanged(this.lstReferralRequest[0]);
  }
  OnNewRecord() {
    debugger;
    this.operation = 'New';
    this.isReadonly = false;

    this.refPhyName = '';
    this.refPhyAddress = '';
    this.refPhyPhone = '';
    this.refPhyFax = '';

    this.notes = '';
    this.signed_by_view = '';
    this.status = '';
    this.signed_by = '';

    this.inputForm.reset();
    (this.inputForm.get("chkImportance") as FormControl).setValue(false);
    if (this.patient != undefined) {
      (this.inputForm.get('txtPatientInput') as FormControl).setValue(this.patient.patient_name);
      this.patientIdRequest = this.patient.patient_id;
      this.patientNameRequest = this.patient.patient_name;
    }
    else {
      (this.inputForm.get('txtPatientInput') as FormControl).setValue('');
      this.patientIdRequest = undefined;
      this.patientNameRequest = '';
    }

    this.EnableDisableDropDown(true);






  }
  EnableDisableDropDown(value) {
    debugger;
    if (value == true) {
      this.inputForm.get('drpLocation').enable();
      this.inputForm.get('drpProvider').enable();
      this.inputForm.get('drpConsultType').enable();
      this.inputForm.get("chkImportance").enable();

      if (this.operation != "New" && this.signed_by != '' && this.signed_by != null) {
        this.inputForm.get('drpLocation').disable();
        this.inputForm.get('drpProvider').disable();
      }
      /*
      else {
        this.inputForm.get('drpLocation').enable();
        this.inputForm.get('drpProvider').enable();
      }
      */

    }
    else {
      this.inputForm.get('drpLocation').disable();
      this.inputForm.get('drpProvider').disable();
      this.inputForm.get('drpConsultType').disable();
      this.inputForm.get("chkImportance").disable();
    }
  }

  OnrefSearch(event, Searchvalue) {
    if (event.key === "Enter") {
      this.isSearchReferral = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        { name: "search_value", value: Searchvalue, option: "name_criteria" }];

      this.searchService.searchRefPhysician(searchCriteria).subscribe(
        data => {

          this.isLoading = false;
          this.lstReferralSearch = data;
        },
        error => {
          this.isLoading = false;
        }
      );

    }
  }
  OnselectReferral(ref) {

    this.refPhyName = ref.last_name + ', ' + ref.first_name;
    this.refPhyAddress = ref.address;
    this.refPhyPhone = ref.phone;
    this.refPhyFax = ref.fax;
    //(this.inputForm.get('txtReferAddress') as FormControl).setValue(ref.address);
    //(this.inputForm.get('txtReferphone') as FormControl).setValue(ref.phone);
    //(this.inputForm.get('txtReferfax') as FormControl).setValue(ref.fax);
    this.isSearchReferral = false;
    this.referral_id = ref.referral_id;

    (this.inputForm.get('txtReferTo') as FormControl).setValue(this.refPhyName);
  }
  OnConsultChnage() {
    this.isSearchReferral = true;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "criteria", value: this.inputForm.get("drpConsultType").value, option: "Consult_criteria" }];

    this.referralService.getReferralSearch(searchCriteria).subscribe(
      data => {

        this.isLoading = false;
        this.lstReferralSearch = data;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  logoutScreenOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };
  deleteRequest(req) {
    const modalRef = this.modalService.open(ConfirmationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = req.referral_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.referralService.deletePatientReferralRequest(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data, req),
            error => alert(error),
            () => this.logMessage.log("delete Successfull.")
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onDeleteSuccessfully(result, element) {
    if (result > 0) {
      var index = this.generalOperation.getElementIndex(this.lstReferralRequest, element);
      if (index > -1) {
        this.lstReferralRequest.splice(index, 1);
      }
    }
  }
  display = 'none';
  onCloseHandled() {
    this.display = 'none';
  }
  openModal(request) {
    debugger;
    //this.display='block'; 
    this.selectedReferral = request;
    (this.statusForm.get('drpStatus') as FormControl).setValue(request.referral_status);
    (this.statusForm.get('txtNotes') as FormControl).setValue(request.notes == null ? '' : request.notes);
  }
  saveObjectWrapper: WrapperObjectSave;
  onSaveReferralStaffNotes(formData) {
    this.saveObjectWrapper = new WrapperObjectSave();
    debugger;
    this.obj_referralStaffNotes = new ORMReferralStaffNotes();
    this.obj_referralStaffNotes.notes = formData.txtNotes;
    this.obj_referralStaffNotes.created_user = this.lookupList.logedInUser.user_name;
    this.obj_referralStaffNotes.client_date_created = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
    this.obj_referralStaffNotes.deleted = false;
    this.obj_referralStaffNotes.patient_id = this.patientIdRequest;// this.patientId;
    this.obj_referralStaffNotes.referral_id = this.selectedReferral.referral_id;
    this.obj_referralStaffNotes.practice_id = this.lookupList.practiceInfo.practiceId;
    this.saveObjectWrapper.ormSave = this.obj_referralStaffNotes;

    this.saveObjectWrapper.lstKeyValue = [];
    this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("referal_status", formData.drpStatus));
    //appointmentSaveObjectWrapper.saveConfirmationList.push(new ORMKeyValue("allow_duplicate","YES"));

    this.referralService.UpdateReferralRequestStatus(this.saveObjectWrapper)
      .subscribe(
        data => this.getReferral(),
        // error => alert(error),
        () => this.logMessage.log("Save Successfull.")
      );
  }
  onImport() {
    const modalRef = this.modalService.open(ImportIcdComponent, this.logoutScreenOptions);
    modalRef.componentInstance.patient_id = this.patientIdRequest;// this.patientId;
    modalRef.componentInstance.chart_id = '0';
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result.length > 0) {
        let strICDs = '';
        for (let i = 0; i < result.length; i++) {
          strICDs += result[i].diag_code + "\t" + result[i].diag_description + "\n";
        }
        if (strICDs != "") {
          strICDs = "Active Diagnosis:\n" + strICDs;

          (this.inputForm.get("txtComments") as FormControl).setValue(strICDs);
        }
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  validate() {
    if ((this.inputForm.get('drpConsultType') as FormControl).value == "" || (this.inputForm.get('drpConsultType') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select Consult Type.", 'warning')
      return false;
    }
    if ((this.inputForm.get('drpProvider') as FormControl).value == "" || (this.inputForm.get('drpProvider') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select Provider.", 'warning')
      return false;
    }
    if ((this.inputForm.get('drpLocation') as FormControl).value == "" || (this.inputForm.get('drpLocation') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select Location.", 'warning')
      return false;
    }
    if (this.patientIdRequest == undefined || this.patientIdRequest == undefined) {
      GeneralOperation.showAlertPopUp(this.modalService, "Validation", "Please select patient.", 'warning')
      return false;
    }
    return true;
  }
  OnSignSave() {
    debugger;
    if (this.validate() == false)
      return;


    // in case of 519 no provider validation for sign
    if (this.lookupList.practiceInfo.practiceId == 519) {

      this.lookupList.providerList.map((pro) => {

        if (pro.id == (this.inputForm.get('drpProvider') as FormControl).value) {
          this.signed_by = pro.name;
        }
      });

      debugger;
      this.OnSave();
      return;
    }
    if (this.lookupList.logedInUser.loginProviderId != 0 && this.lookupList.logedInUser.loginProviderId != null
      && this.lookupList.logedInUser.loginProviderId == (this.inputForm.get('drpProvider') as FormControl).value) {
      this.signed_by = this.lookupList.logedInUser.loginProviderName;
      this.OnSave();
      return;
    }
    const modalRef = this.modalService.open(ProviderAuthenticationPopupComponent, this.logoutScreenOptions);
    modalRef.componentInstance.provider_id = (this.inputForm.get('drpProvider') as FormControl).value;
    modalRef.componentInstance.headerTitle = "Confirm Referral Request Sign";
    modalRef.result.then((result) => {
      if (result != null) {
        debugger;
        this.signed_by = result['user_name'];
        this.OnSave();
      }
    }, (reason) => {
      //alert(reason);
    });
  }



  showPatientSearchForm: boolean = false;
  patientNameSearchForm: string = '';
  patientIdSearchForm: string = '';
  onPatientSearchFormKeydown(event) {
    debugger;
    if (event.key === "Enter") {
      this.showPatientSearchForm = true;
    }
    else {
      this.showPatientSearchForm = false;
    }
  }
  onPatientSearchFormInputChange(newValue) {
    this.logMessage.log("onPatientSearchFormInputChange");
    if (newValue !== this.patientNameSearchForm) {
      this.patientIdSearchForm = undefined;
      this.searchForm.get("txtPatientIdHiddenSearchFrom").setValue(null);
    }


    //this.patientName=undefined;
  }
  onPatientSearchFormBlur() {
    this.logMessage.log("onPatientSearchFormBlur");

    if (this.patientIdSearchForm == undefined && this.showPatientSearchForm == false) {
      this.patientNameSearchForm = undefined;
      this.searchForm.get("txtPatientSearchFrom").setValue(null);
      this.searchForm.get("txtPatientIdHiddenSearchFrom").setValue(null);
    }
    //this.patientId=undefined;
  }
  onSelectSearchFormPatient(patObject) {
    debugger;
    this.logMessage.log(patObject);

    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {

        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientSearchForm();
        }
      }
        , (reason) => {
          //alert(reason);
        });

      return;
    }


    this.patientIdSearchForm = patObject.patient_id;
    this.patientNameSearchForm = patObject.name;

    this.searchForm.get("txtPatientIdHiddenSearchFrom").setValue(this.patientIdSearchForm);
    this.searchForm.get("txtPatientSearchFrom").setValue(this.patientNameSearchForm);
    this.showPatientSearchForm = false;

  }
  closePatientSearchForm() {
    this.showPatientSearchForm = false;
    this.onPatientSearchFormBlur();
  }

  searchCriteria: SearchCriteria = new SearchCriteria();
  onSearchClick(searchFormData) {
    //this.searchReport(formData);
    this.searchCriteria = new SearchCriteria();
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.param_list = [
      { name: "referral_request", value: "1" }
    ];

    if (this.patientIdSearchForm != undefined && this.patientIdSearchForm != '') {
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientIdSearchForm });
    }

    let dateFrom = this.dateTimeUtil.getStringDateFromDateModel(searchFormData.dateFrom);
    let dateTo = this.dateTimeUtil.getStringDateFromDateModel(searchFormData.dateTo);


    if (dateFrom != undefined && dateFrom != '') {
      this.searchCriteria.param_list.push({ name: "date_from", value: dateFrom });
    }
    if (dateTo != undefined && dateTo != '') {
      this.searchCriteria.param_list.push({ name: "date_to", value: dateTo });
    }

    if (searchFormData.ddLocationSearch != undefined && searchFormData.ddLocationSearch != '') {
      this.searchCriteria.param_list.push({ name: "location_id", value: searchFormData.ddLocationSearch });
    }

    if (searchFormData.ddProviderSearch != undefined && searchFormData.ddProviderSearch != '') {
      this.searchCriteria.param_list.push({ name: "provider_id", value: searchFormData.ddProviderSearch });
    }

    if (searchFormData.ddConsultTypeSearch != undefined && searchFormData.ddConsultTypeSearch != '') {
      this.searchCriteria.param_list.push({ name: "consult_type", value: searchFormData.ddConsultTypeSearch });
    }

    if (searchFormData.ddStatusSearch != undefined && searchFormData.ddStatusSearch != '') {
      this.searchCriteria.param_list.push({ name: "status", value: searchFormData.ddStatusSearch });
    }

    if (searchFormData.chkHighImpSearch != undefined && searchFormData.chkHighImpSearch == true) {
      this.searchCriteria.param_list.push({ name: "high_important", value: "1" });
    }

    this.getReferral();
  }

  openPatient(patient) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = patient.patient_id;
    obj.patient_name = patient.patient_name;
    obj.child_module = PatientSubTabsEnum.REFERRAL;
    this.openModuleService.openPatient.emit(obj);
  }




  showPatientInput: boolean = false;
  onPatientInputKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientInput = true;
    }
    else {
      this.showPatientInput = false;
    }
  }
  onPatientInputChange(newValue) {
    this.logMessage.log("onPatientInputChange");
    if (newValue !== this.patientNameRequest) {
      this.patientIdRequest = undefined;
      this.inputForm.get("txtPatientIdHiddenInput").setValue(null);
    }

  }
  onPatientInputBlur() {
    this.logMessage.log("onPatientInputBlur");

    if (this.patientIdRequest == undefined && this.showPatientInput == false) {
      this.patientNameRequest = undefined;
      this.inputForm.get("txtPatientInput").setValue(null);
      this.inputForm.get("txtPatientIdHiddenInput").setValue(null);
    }
    //this.patientId=undefined;
  }
  onSelectInputPatient(patObject) {
    debugger;
    this.logMessage.log(patObject);

    if (patObject.patient_status === 'INACTIVE' || patObject.patient_status === 'DECEASED') {
      const modalRef = this.modalService.open(AlertPopupComponent, this.poupUpOptions);
      modalRef.componentInstance.promptHeading = "Appointment"
      modalRef.componentInstance.promptMessage = "Selected Patient is " + patObject.patient_status;
      modalRef.result.then((result) => {

        //alert(result);
        if (result === PromptResponseEnum.OK) {
          this.closePatientInput();
        }
      }
        , (reason) => {
          //alert(reason);
        });

      return;
    }


    this.patientIdRequest = patObject.patient_id;
    this.patientNameRequest = patObject.name;

    this.inputForm.get("txtPatientIdHiddenInput").setValue(this.patientIdRequest);
    this.inputForm.get("txtPatientInput").setValue(this.patientNameRequest);
    this.showPatientInput = false;

  }
  closePatientInput() {
    this.showPatientInput = false;
    this.onPatientInputBlur();
  }
}
