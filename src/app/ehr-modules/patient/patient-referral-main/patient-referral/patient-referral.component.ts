import { FormsModule } from '@angular/forms';
import { GeneralOperation } from './../../../../shared/generalOperation';
import { WrapperObjectSave } from './../../../../models/general/wrapper-object-save';
import { DateTimeFormat } from './../../../../shared/date-time-util';
import { ORMReferralStaffNotes } from './../../../../models/patient/orm-referral-staff-notes';
import { ORMPatientReferral } from './../../../../models/patient/orm-patient-referral';
import { LogMessage } from './../../../../shared/log-message';
import { ReferralService } from './../../../../services/patient/referral.service';
import { Component, OnInit, Inject, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from '../../../../providers/lookupList.module';
import { SearchCriteria } from '../../../../models/common/search-criteria';
import { DateTimeUtil } from '../../../../shared/date-time-util';
import { Chartreport_Print } from 'src/app/models/encounter/Chartreport_Print';
import { EncounterFaxObservable } from 'src/app/services/observable/encounter-fax-observable';
import { EncounterService } from 'src/app/services/encounter/encounter.service';
import { PatientService } from 'src/app/services/patient/patient.service';
import { ListFilterPipe } from 'src/app/shared/list-filter-pipe';
import { PhonePipe } from 'src/app/shared/phone-pipe';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { ReferralViewersComponent } from 'src/app/general-modules/referral-viewers/referral-viewers.component';
import { ServiceResponseStatusEnum, AlertTypeEnum, PromptResponseEnum, FaxAttachemntsTypeEnum } from 'src/app/shared/enum-util';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { GeneralService } from 'src/app/services/general/general.service';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AppConfig, APP_CONFIG } from 'src/app/providers/app-config.module';
import { EncounterHTMLModel } from 'src/app/models/encounter/encounter-html-model';
import { SendFaxAttachmentsFromClient } from 'src/app/models/fax/send-fax-attachments-from-client';
import { Subscription } from 'rxjs';
import { FaxParam } from 'src/app/ehr-modules/fax/new-fax/fax-parm';
import { FaxService } from 'src/app/services/fax.service';
import { NewFaxComponent } from 'src/app/ehr-modules/fax/new-fax/new-fax.component';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'patient-referral',
  templateUrl: './patient-referral.component.html',
  styleUrls: ['./patient-referral.component.css']
})
export class PatientReferralComponent implements OnInit {

  @Input() patientId;
  lstReferral_faxDetail;
  lstReferral_emailDetail;
  lstSentFaxAttachments;
  lstlab;
  lstvisits;
  lstReferralSearch;
  lstConsultType;
  lstPatientReferral;
  dashboardAddEdit = false;

  isProcessing: boolean = false;
  isLoading: boolean = false;
  isMainLoading: boolean = false;


  inputForm: FormGroup;
  statusForm: FormGroup;
  rowId;
  referral_id;
  operation = '';
  isReadonly = true;
  referral_View_Operation = '';
  public isSearchReferral = false;
  selectedReferral;
  private obj_patient_referral: ORMPatientReferral;
  private obj_referralStaffNotes: ORMReferralStaffNotes;


  selectedFaxSentId: number;
  controlUniqueId: string = '';

  refPhyName: string = '';
  refPhyAddress: string = '';
  refPhyPhone: string = '';
  refPhyFax: string = '';
  refPhyEmail: string = '';


  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,

  };

  constructor(private formBuilder: FormBuilder,
    private referralService: ReferralService,
    private logMessage: LogMessage,
    private generalOperation: GeneralOperation,
    private dateTimeUtil: DateTimeUtil,
    @Inject(LOOKUP_LIST) public lookupList: LookupList, private objchartReport: Chartreport_Print
    , private encounterFaxObservable: EncounterFaxObservable, private encounterService: EncounterService
    , private patientService: PatientService, private ngbModal: NgbModal, private domSanitizer: DomSanitizer
    , private generalService: GeneralService, @Inject(APP_CONFIG) private config: AppConfig,
    private faxService: FaxService, private searchService: SearchService) {



  }

  loadingCount: number = 0;
  ngOnInit() {
    this.controlUniqueId = this.patientId + "_referral";
    this.isMainLoading = true;
    this.loadingCount = 4;
    this.onGetReferral();
    this.onGetConsultType();
    this.getChartSummary();
    this.getLabSummary();
    this.buildForm();

  }
  showAddEdit() {
    this.dashboardAddEdit = true;
  }

  getChartSummary() {
    this.referralService.getReferralChartSummary(this.patientId).subscribe(
      data => {
        this.lstvisits = data;

        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isMainLoading = false;
        }
        this.isLoading = false;
      },
      error => {
        error => alert(error);
      }
    );

  }

  getLabSummary() {
    this.referralService.getPatientLabOrders(this.patientId).subscribe(
      data => {
        this.lstlab = data;

        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isMainLoading = false;
        }
        this.isLoading = false;
      },
      error => {
        error => alert(error);
      }
    );

  }
  getFaxDetail(referal_id) {
    this.referralService.getReferralsFaxDetails(referal_id).subscribe(
      data => {
        this.lstReferral_faxDetail = data;
        this.lstSentFaxAttachments = null;
        if (this.lstReferral_faxDetail.length > 0) {

          this.onFaxDetailChange(this.lstReferral_faxDetail[0]);
        }
      },
      error => {
        error => alert(error);
      }
    );

  }
  getEmailDetail(referal_id) {
    this.referralService.getReferralsEmailDetails(referal_id).subscribe(
      data => {
        this.lstReferral_emailDetail = data;
      },
      error => {
        error => alert(error);
      }
    );
  }
  onFaxDetailChange(faxSent: any) {

    this.selectedFaxSentId = faxSent.fax_sent_id;

    this.lstSentFaxAttachments = null;

    let faxSentId: number;

    if (faxSent.fax_sent_id_main != undefined
      && faxSent.fax_sent_id_main != null
      && faxSent.fax_sent_id_main != '') {
      faxSentId = faxSent.fax_sent_id_main;
    }
    else {
      faxSentId = faxSent.fax_sent_id;
    }


    this.faxService.getSentFaxAttachments(faxSentId).subscribe(
      data => {
        this.lstSentFaxAttachments = data;
      },
      error => {
        error => alert(error);
      }
    );
  }

  OnNewRecord() {
    debugger;
    this.dashboardAddEdit = true;
    //this.inputForm.reset();
    this.operation = 'New';
    this.isReadonly = false;
    this.inputForm.reset();
    //
    (this.inputForm.get('txtSincerely') as FormControl).setValue("Thank you for Assisting our patient.");
    (this.inputForm.get('txtSignedBy') as FormControl).setValue("");
    this.signed_by_requested = "";
    //this.date_signed_requested = "";

    this.isSearchReferral = false;

    for (var i = 0; i < this.lstvisits.length; i++) {
      this.lstvisits[i].chkbx = false;
    }
    for (var i = 0; i < this.lstlab.length; i++) {
      this.lstlab[i].chkbx = false;
    }
    // if ((<HTMLInputElement>document.getElementById("chk_enc-all")) != null) 
    //     (<HTMLInputElement>document.getElementById("chk_enc-all")).value = 'false';
    // if ((<HTMLInputElement>document.getElementById("chk-lab-all")) != null) 
    //     (<HTMLInputElement>document.getElementById("chk-lab-all")).value = 'false';
  }

  OnCancel() {
    this.isReadonly = true;
    this.operation = '';
    this.dashboardAddEdit = false;
    this.isSearchReferral = false;
  }

  OnSave() {
    this.obj_patient_referral = new ORMPatientReferral();

    this.obj_patient_referral.patient_id = this.patientId;
    this.obj_patient_referral.location_id = (this.inputForm.get('drpLocation') as FormControl).value;
    this.obj_patient_referral.provider_id = (this.inputForm.get('drpProvider') as FormControl).value;
    this.obj_patient_referral.consult_type_id = (this.inputForm.get('drpConsultType')).value;
    this.obj_patient_referral.referral_reason = (this.inputForm.get('txtComments')).value;

    if (this.referral_id != "")
      this.obj_patient_referral.referral_provider_id = this.referral_id;
    this.obj_patient_referral.referral_provider_name = this.refPhyName;// (this.inputForm.get('txtReferTo')).value;
    this.obj_patient_referral.referral_provider_address = this.refPhyAddress;// (this.inputForm.get('txtAddress')).value;
    this.obj_patient_referral.referral_provider_fax = this.refPhyFax;// (this.inputForm.get('txtFax')).value;
    this.obj_patient_referral.referral_provider_phone = this.refPhyPhone;// (this.inputForm.get('txtPhone')).value;
    this.obj_patient_referral.referral_provider_email = this.refPhyEmail;// (this.inputForm.get('txtEmail')).value;
    this.obj_patient_referral.referral_status = "Pending";
    this.obj_patient_referral.client_date_modified = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss);
    this.obj_patient_referral.modified_user = this.lookupList.logedInUser.user_name;
    this.obj_patient_referral.practice_id = this.lookupList.practiceInfo.practiceId;
    this.obj_patient_referral.referral_request = true;
    this.obj_patient_referral.high_importance = false;
    this.obj_patient_referral.deleted = false;

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

    this.saveObjectWrapper = new WrapperObjectSave();
    this.saveObjectWrapper.ormSave = this.obj_patient_referral;
    this.saveObjectWrapper.lstKeyValue = [];
    let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
    this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("upload_path", docPath[0].upload_path))
    this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("dest_path", this.generated_pdf_path_temp))
    //
    debugger;
    this.referralService.savePatientReferral(this.saveObjectWrapper)
      .subscribe(
        data => this.savedSuccessfull(data),
        error => alert(error),
        () => this.logMessage.log("Save Patient Referral Request.")
      );
  }
  generated_pdf_url_link: string = "";
  generated_pdf_url_temp: string = "";
  generated_pdf_path_temp: string = "";
  savedSuccessfull(data) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      if (this.operation == 'New' || this.operation == 'Edit') {
        this.onGetReferral();
        this.dashboardAddEdit = false;
      }
      if (this.referral_View_Operation == "SAVEFAX") {
        debugger;
        let docLink: string = "";
        if (data.response_list != undefined && data.response_list.length > 0) {
          data.response_list.forEach(kv => {
            if ((kv as ORMKeyValue).key == 'doc_link') {
              docLink = kv.value;
            }
          });
        }
        this.onFax(data.response, docLink);
      }
      if (this.referral_View_Operation == "SAVEDOWNLOAD") {

      }
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.lgPopUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Referral Save';
      modalRef.componentInstance.promptMessage = data.response;
    }

    // this.selectedReferral = null;
    // this.isReadonly = true;
    // this.operation = '';
    // this.dashboardAddEdit = false;
  }
  doc_path = '';
  downloafileResponse(data, doc_link) {
    // if (data.byteLength <= 0)
    //   return;
    debugger;
    let file_ext: string = doc_link.substring(doc_link.indexOf('.') + 1, doc_link.length);
    let file_type: string = '';
    switch (file_ext.toLowerCase()) {
      case 'png':
        file_type = 'IMAGE/PNG';
        break;
      case 'jpg':
        file_type = 'IMAGE/JPEG';
        break;
      case 'pdf':
        file_type = 'application/pdf';
        break;
      case 'txt':
        file_type = 'text/plain';
        break;
    }
    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}

    this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));


  }
  hideAddEdit() {
    this.dashboardAddEdit = false;
  }
  buildForm() {
    this.inputForm = this.formBuilder.group({
      drpProvider: this.formBuilder.control("", Validators.required),
      drpLocation: this.formBuilder.control("", Validators.required),
      drpConsultType: this.formBuilder.control("", Validators.required),
      txtReferTo: this.formBuilder.control("", Validators.required),
      //txtProvider: this.formBuilder.control("", Validators.required),
      //txtAddress: this.formBuilder.control("", Validators.required),
      //txtPhone: this.formBuilder.control("", Validators.required),
      //txtFax: this.formBuilder.control("", Validators.required),
      //txtEmail: this.formBuilder.control(""),
      txtSincerely: this.formBuilder.control("Thank you for Assisting our patient."),
      txtSignedBy: this.formBuilder.control(""),
      txtComments: this.formBuilder.control("")
    })
    this.statusForm = this.formBuilder.group({
      drpStatus: this.formBuilder.control("", Validators.required),
      txtNotes: this.formBuilder.control("", Validators.required)
    })
  }
  private buildChapters() {
    debugger;
    const chapters = this.lstPatientReferral.map(chapter => {
      return this.formBuilder.control(chapter.col2)
    });
    return this.formBuilder.array(chapters);
  }
  onGetReferral() {

    let criteria: SearchCriteria = new SearchCriteria();
    criteria.practice_id = this.lookupList.practiceInfo.practiceId;
    criteria.param_list = [{ name: "patient_id", value: this.patientId }];
    //,{ name: "criteria12",value: this.patientId,option:""}];
    this.lstPatientReferral = undefined;
    this.isLoading = true;
    this.referralService.getPatientReferral(criteria).subscribe(
      data => {
        debugger;

        this.lstPatientReferral = data;
        //this.buildForm();
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isMainLoading = false;
        }
        this.isLoading = false;
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


        this.lstConsultType = data;

        this.loadingCount--;
        this.loadingCount--;
        if (this.loadingCount == 0) {
          this.isMainLoading = false;
        }
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  OnSelectionChanged(referal) {
    this.rowId = referal.referral_id;
    this.getFaxDetail(referal.referral_id);
    this.getEmailDetail(referal.referral_id);

  }
  OnConsultChnage() {
    this.isSearchReferral = false;
    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "criteria", value: this.inputForm.get("drpConsultType").value, option: "Consult_criteria" }];

    this.referralService.getReferralSearch(searchCriteria).subscribe(
      data => {

        this.isLoading = false;
        this.lstReferralSearch = data;
        if (this.lstReferralSearch.length > 0) {
          this.isSearchReferral = true;
        }
        else {
          this.isSearchReferral = false;
        }
      },
      error => {
        this.isLoading = false;
      }
    );
  }
  OnselectReferral(ref) {

    this.referral_id = ref.referral_id;
    this.refPhyName = ref.last_name + ', ' + ref.first_name;
    this.refPhyAddress = ref.address;
    this.refPhyPhone = ref.phone;
    this.refPhyFax = ref.fax;
    this.refPhyEmail = ref.email;

    (this.inputForm.get('txtReferTo') as FormControl).setValue(this.refPhyName);
    //(this.inputForm.get('txtProvider') as FormControl).setValue(ref.last_name + ', ' + ref.first_name);

    //(this.inputForm.get('txtAddress') as FormControl).setValue(ref.address);
    //(this.inputForm.get('txtPhone') as FormControl).setValue(ref.phone);
    //(this.inputForm.get('txtFax') as FormControl).setValue(ref.fax);
    //(this.inputForm.get('txtEmail') as FormControl).setValue(ref.email);
    this.isSearchReferral = false;

  }

  displayValue = true;
  display = 'none';
  openModal(request) {
    debugger;
    this.display = 'block';
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
    this.obj_referralStaffNotes.patient_id = this.patientId;
    this.obj_referralStaffNotes.referral_id = this.selectedReferral.referral_id;
    this.obj_referralStaffNotes.practice_id = this.lookupList.practiceInfo.practiceId;
    this.saveObjectWrapper.ormSave = this.obj_referralStaffNotes;

    this.saveObjectWrapper.lstKeyValue = [];
    this.saveObjectWrapper.lstKeyValue.push(new ORMKeyValue("referal_status", formData.drpStatus))
    //appointmentSaveObjectWrapper.saveConfirmationList.push(new ORMKeyValue("allow_duplicate","YES"));

    this.referralService.UpdateReferralRequestStatus(this.saveObjectWrapper)
      .subscribe(
        data => {
          this.onGetReferral()
        },
        // error => alert(error),
        () => this.logMessage.log("Save Successfull.")
      );
  }
  chkEncounterSelectChange(value, enc) {
    debugger;
    this.lstvisits[this.generalOperation.getElementIndex(this.lstvisits, enc)].chkbx = value;
  }
  checkAllEncounter(value) {
    debugger;
    for (var i = 0; i < this.lstvisits.length; i++) {
      this.lstvisits[i].chkbx = value;
    }
  }
  chkLabSelectChange(value, lab) {
    this.lstlab[this.generalOperation.getElementIndex(this.lstlab, lab)].chkbx = value;
  }
  checkAllLabSummary(value) {
    for (var i = 0; i < this.lstlab.length; i++) {
      this.lstlab[i].chkbx = value;
    }
  }
  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  onSaveReferralView(pat) {
    let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");

    this.generated_pdf_url_temp = this.generalOperation.ReplaceAll((docPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/PatientDocuments/" + pat.referral_path).toString(), "\\", "/");
    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = this.generated_pdf_url_temp;
    modalRef.componentInstance.width = '800px';
  }

  onDelete(ref) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.lgPopUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Do you want to delete selected record ?';
    modalRef.componentInstance.alertType = 'danger';
    let closeResult;
    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = ref.referral_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;


        this.referralService.deletePatientReferralRequest(deleteRecordData)
          .subscribe(
            data => this.onDeleteSuccessfully(data, ref),
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
      var index = this.generalOperation.getElementIndex(this.lstPatientReferral, element);
      if (index > -1) {
        this.lstPatientReferral.splice(index, 1);
      }
    }
  }


  lstSelectedVisits = new Array();
  selectedVisitIndex = 0;
  strVisitsHTMLComplete = "";
  private referralFaxSubscription: Subscription;
  OnView() {
    //this.isLoding=true;
    //this.isProcessing=true;
    this.strVisitsHTMLComplete = '';
    this.lstSelectedVisits = new Array();
    this.selectedVisitIndex = 0;
    debugger;
    this.lstSelectedVisits = new Array();
    for (let i = 0; i < this.lstvisits.length; i++) {
      if (this.lstvisits[i].chkbx == true) {
        this.lstSelectedVisits.push({
          chart_id: this.lstvisits[i].chart_id,
          visit_date: this.lstvisits[i].visit_date,
        });
      }
    }
    this.referralFaxSubscription = this.encounterFaxObservable.getHtml.subscribe(
      value => {
        debugger;
        let encounterHTMLModel: EncounterHTMLModel = value;
        this.strVisitsHTMLComplete += encounterHTMLModel.htmlString, '<br>', '<br></br>';//encounterHTMLModel.htmlString;
        this.selectedVisitIndex++;
        this.getNextVisitHTML(this.selectedVisitIndex);
      });
    this.selectedVisitIndex = 0;
    this.isProcessing = true;
    this.getNextVisitHTML(this.selectedVisitIndex);
  }
  acPrintSetting;
  getNextVisitHTML(index) {
    debugger;
    if (index > 0) {
      this.strVisitsHTMLComplete += "<div style='height:15px;width=100%'></div>";
    }
    if (this.lstSelectedVisits != null && this.lstSelectedVisits.length > index) {
      this.objchartReport.strHtmlString = "";
      this.objchartReport.chartId = this.lstSelectedVisits[index].chart_id;
      this.objchartReport.patientId = this.patientId;
      this.acPrintSetting = this.lookupList.lstUserChartModuleSetting.slice();
      this.objchartReport.acPrintSetting = this.lookupList.lstUserChartModuleSetting;
      this.objchartReport.callingFrom = "referral";
      //objChartReport.PdfCallBackToReferral = PdfCallBackToReferral;

      this.objchartReport.file_name = "test";//dgreport.selectedItem.name;
      this.objchartReport.getReportData();
    }
    else {
      this.referralFaxSubscription.unsubscribe();
      this.getData();

    }
    //this.isLoding=false;
  }
  resultSetCount = 0;
  acMedication;
  acAllergies;
  acInsurances;
  acLabResults;
  patientData;

  getData() {
    this.resultSetCount = 0;
    this.resultSetCount++;
    this.encounterService.getChartPrescriptionView(this.patientId.toString())
      .subscribe(
        data => {
          this.acMedication = data;
          this.resultSetCount--;
          if (this.resultSetCount == 0) {
            this.getHTML();
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting Prescription list.")
        }
      );

    this.resultSetCount++;
    this.encounterService.getChartAllergyView(this.patientId.toString())
      .subscribe(
        data => {
          this.acAllergies = data;
          this.resultSetCount--;
          if (this.resultSetCount == 0) {
            this.getHTML();
          }
        },
        error => {
          this.logMessage.log("An Error Occured while getting getChartAllergyView.")
        }
      );

    this.resultSetCount++;
    this.patientService.getPatientInsurance(this.patientId, 'active').subscribe(
      data => {
        debugger;
        this.acInsurances = data as Array<any>;
        this.resultSetCount--;
        if (this.resultSetCount == 0) {
          this.getHTML();
        }
      },
      error => {
        this.logMessage.log("An Error Occured while getPatientInsurance.")
      }
    );
    this.resultSetCount++;
    this.getPatientInfo();

    let strLabOrderIDs = "";
    for (var i = 0; i < this.lstlab.length; i++) {
      if (strLabOrderIDs != "") {
        strLabOrderIDs += ",";
      }
      strLabOrderIDs += "'" + this.lstlab[i].order_id + "'";
    }
    if (strLabOrderIDs != "") {
      let criteria: SearchCriteria = new SearchCriteria();
      criteria.practice_id = this.lookupList.practiceInfo.practiceId;
      criteria.param_list = [{ name: "criteria", value: strLabOrderIDs }];

      this.resultSetCount++;
      this.referralService.getPatientOrderResults(criteria).subscribe(
        data => {
          this.acLabResults = data;
          this.resultSetCount--;
          if (this.resultSetCount == 0) {
            this.getHTML();
          }
        },
        error => {
        }
      );
    }
  }
  getPatientInfo() {
    this.patientService.getPatient(this.patientId).subscribe(
      data => {
        this.patientData = data;
        this.resultSetCount--;
        if (this.resultSetCount == 0) {
          this.getHTML();
        }
      },
      error => {
      }
    );
  }

  signed_by_requested = "";
  //date_signed_requested = "";
  front_page_comments_height: String = "350";
  strHTMLString = "";
  getHTML() {

    debugger;
    if ((this.inputForm.get('txtSignedBy') as FormControl).value != undefined ||
      (this.inputForm.get('txtSignedBy') as FormControl).value != '') {
      this.signed_by_requested = (this.inputForm.get('txtSignedBy') as FormControl).value;
    }

    debugger;
    let selectedLocation = new ListFilterPipe().transform(this.lookupList.locationList, "id", (this.inputForm.get('drpLocation') as FormControl).value);
    let strPracticeAddress = selectedLocation[0].address
      + ((selectedLocation[0].city == null || selectedLocation[0].city == "") ? "" : (", " + selectedLocation[0].city))
      + ((selectedLocation[0].state == null || selectedLocation[0].state == "") ? "" : (", " + selectedLocation[0].state))
      + ((selectedLocation[0].zip == null || selectedLocation[0].zip == "") ? "" : (" " + selectedLocation[0].zip));

    let selectedProvider = new ListFilterPipe().transform(this.lookupList.providerList, "id", (this.inputForm.get('drpProvider') as FormControl).value);

    let ProviderName = selectedProvider[0].name;
    let ProviderAddress = this.lookupList.practiceInfo.address1
      + ((selectedLocation[0].city == null || selectedLocation[0].city == "") ? "" : (", " + selectedLocation[0].city))
      + ((selectedLocation[0].state == null || selectedLocation[0].state == "") ? "" : (", " + selectedLocation[0].state))
      + ((selectedLocation[0].zip == null || selectedLocation[0].zip == "") ? "" : (" " + selectedLocation[0].zip));

    let ProviderPhone = (new PhonePipe().transform(selectedLocation[0].phone));
    let ProviderFax = (new PhonePipe().transform(selectedLocation[0].fax));

    let ProviderEmail = "";
    let ProviderComments = "";
    if ((this.inputForm.get('txtComments')).value != "") {
      ProviderComments = this.generalOperation.ReplaceAll((this.inputForm.get('txtComments')).value, "\n", "<br></br>");
    }
    else {
      ProviderComments = "";
    }
    let acPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PracticeLogo");
    var strLogoHTML: String = "";
    if (acPath != null && acPath.length > 0) {
      var logoPath: String = "";
      logoPath = acPath[0].download_path + "/" + this.lookupList.practiceInfo.practiceId + "/PracticeLogo/logo-small.png";
      logoPath = logoPath.replace("\\", "/");
      strLogoHTML = "<img src='" + logoPath + "' width='175'/>";
    }

    this.strHTMLString = "<html>"
      + "<head>";
    this.strHTMLString += "	<style>"
      + "	.stylePracticeHeder {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;     font-weight: bold;      font-size: 17px; color:#000000; }"
      + "	.styleTopHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-weight: bold;	font-size: 17px; color:#00000;}"
      + "	.styleTopSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-weight: bold;	font-size: 11px; color:#0f4977;}"
      + "	.styleModuleSubHeader {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-size: 11px;   valign:center;  background-color: #f4fafd; color:#000000; font-weight:bold;}"
      + "	.styleMainHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif; font-weight: bold; font-size: 12px; color:#0f4977;}"
      + "	.styleNormal {font-size: 10px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;} "
      + "	.styleNormaldate {font-size: 9.3px !important;} "
      + "	.styleNormalBold {font-size: 10px; font-family:Trebuchet MS, Arial, Helvetica, sans-serif;font-weight: bold;}"
      + "	.styleSubHeading {font-family:Trebuchet MS, Arial, Helvetica, sans-serif;	font-size: 11px;	font-weight: bold;}"
      + "	.tableMain{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:10px;font-family:Calibri;border-collapse:collapse;border:.1px solid #5bb6d0;}"
      + "	.tableMain td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #5bb6d0;padding:3px 5px 2px 5px;}"
      + "	.tableMain tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:.1px solid #5bb6d0; }"
      + "	.tableMain th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:11px;text-align:left;padding:3px 5px 2px 5px;background-color:#f4fafd;color:#000000;}"
      + "	.tableNoBorder{font-family:Trebuchet MS,Arial,Helvetica, sans-serif;font-size:10px;font-family:Arial;border-collapse:collapse;border: border:0px;} "
      + "	.tableNoBorder td {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ;padding:3px 5px 2px 5px;valign:top;} "
      + "	.tableNoBorder tr {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;border:0px ; } "
      + "	.tableNoBorder th {font-family:Trebuchet MS,Arial,Helvetica, sans-serif;valign:center;text-align:left;  background-color: #f4fafd; color:#000000; font-weight:bold;font-size:11px;border:.1px solid #5bb6d0;padding:3px 5px 2px 5px;}"
      + "	.pagebreak { page-break-before: always; }"
      + "	</style>";
    this.strHTMLString += "</head>"
      + "<body >";

    if (strLogoHTML != "") {
      this.strHTMLString += " <table width='100%' border='0' cellpadding='0' cellspacing='0'>"
        + "	<tr>"
        + "	   <td rowspan='3' width='200' align='center' valign='top'>" + strLogoHTML + "</td>"
        + "	   <td height='20' align='right' valign='top'><span class='styleNormal'>" + this.dateTimeUtil.getCurrentDateTimeString() + "</span></td>"
        + "	</tr>"
        + "	<tr>"
        + "		<td height='20' align='left' valign='top'><span class='stylePracticeHeder'>" + this.lookupList.practiceInfo.practiceName + "</span></td>"
        + "	</tr>"
        + "	<tr >"
        + "  	<td align='left' valign='top'><span class='styleTopSubHeader'>" + strPracticeAddress + "</span></td>"
        + "	</tr> "
        + "</table>";
    }
    else {
      this.strHTMLString += " <table width='100%' border='0' cellpadding='0' cellspacing='0'>"
        + "	<tr>"
        + "	   <td height='20' align='right' valign='top'><span class='styleNormal'>" + this.dateTimeUtil.getCurrentDateTimeString() + "</span></td>"
        + "	</tr>"
        + "	<tr>"
        + "		<td height='20' align='center' valign='top'><span class='stylePracticeHeder'>" + this.lookupList.practiceInfo.practiceName + "</span></td>"
        + "	</tr>"
        + "	<tr >"
        + "  	<td align='center' valign='top'><span class='styleTopSubHeader'>" + strPracticeAddress + "</span></td>"
        + "	</tr> "
        + "</table>";
    }
    this.strHTMLString += "<div style='height:15px;width=100%'></div>";

    if(this.refPhyPhone == null ||this.refPhyPhone == '' )
    {
      this.refPhyPhone='';
    }
    else
    {
      this.refPhyPhone = (new PhonePipe().transform(this.refPhyPhone));
    }
    if(this.refPhyFax == null ||this.refPhyFax == '' )
    {
      this.refPhyFax='';
    }
    else
    {
      this.refPhyFax = (new PhonePipe().transform(this.refPhyFax));
    }

    this.strHTMLString += "<table width='100%' class='tableMain'>" +
      "<tr >" +
      "  <td colspan='2' height='40' align='center' valign='middle'><span class='styleTopHeader'>REFERRAL LETTER </span></td>" +
      "</tr>" +
      "<tr height='30'>" +
      "  <td height='40' align='center' valign='middle'><span class='styleTopHeader'>FROM</span></td>" +
      "  <td height='40' align='center' valign='middle'><span class='styleTopHeader'>TO</span></td>" +
      "</tr>" +
      "<tr valign='top'>" +
      "  <td width='50%'><table width='100%' class='tableNoBorder'>" +
      "	  <tr>" +
      "		<td width='60' align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Provider:</span></td>" +
      "		<td  width='300' ><span  valign='top' class='styleNormal'  >" + ProviderName + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Address:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + ProviderAddress + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Phone:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + ((ProviderPhone == null || ProviderPhone == '') ? '' : (ProviderPhone)) + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Fax:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + ((ProviderFax == null || ProviderFax == '') ? '' : (ProviderFax)) + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Email:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + ((ProviderEmail == null || ProviderEmail == '') ? '' : (ProviderEmail)) + "</span></td>" +
      "	  </tr>" +
      "	</table></td>" +
      "  <td  width='50%'><table width='100%' class='tableNoBorder'>" +
      "	  <tr >" +
      "		<td width='60' align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Provider:</span></td>" +
      "		<td width='300' ><span  valign='top' class='styleNormal'  >" + ((this.refPhyName == null || this.refPhyName == '') ? '' : (this.refPhyName)) + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Address:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + ((this.refPhyAddress == null || this.refPhyAddress == '') ? '' : (this.refPhyAddress)) + "</span></td>" +
      "	  </tr>" +
      "	  <tr>" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Phone:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + ((this.refPhyPhone == null || this.refPhyPhone == '') ? '' : (this.refPhyPhone)) + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Fax:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal' >" + ((this.refPhyFax == null || this.refPhyFax == '') ? '' : (this.refPhyFax)) + "</span></td>" +
      "	  </tr>" +
      "	  <tr>" +
      "		<td align='left' >&nbsp;&nbsp;<span class='styleNormalBold'>Email:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'>" + ((this.refPhyEmail == null || this.refPhyEmail == '') ? '' : (this.refPhyEmail)) + "</span></td>" +
      "	  </tr>" +
      "	</table></td>" +
      "</tr>" +
      "</table>";
    debugger;
    let PatientName: string = "";
    let PatientAge: number;
    let PatientDOB: String = "";
    let PatientGender: String = "";
    let PatientCellPhone: String = "";
    let PatientHomePhone: String = "";
    let PatientEmail: String = "";
    let PatientAddress: String = "";
    if (this.patientData != null) {
      PatientName = this.patientData.last_name + ", " + this.patientData.first_name;
      PatientDOB = this.patientData.dob;
      PatientGender = this.patientData.gender_code;
      // PatientCellPhone = this.patientData.cell_phone;
      // PatientHomePhone = this.patientData.home_phone;
      PatientCellPhone = (new PhonePipe().transform(this.patientData.cell_phone));
      PatientHomePhone = (new PhonePipe().transform(this.patientData.home_phone));
      PatientEmail = this.patientData.email;
      PatientAddress = this.patientData.address + ' ' + this.patientData.city + ', ' + this.patientData.state + ' ' + this.patientData.zip;
      if(this.patientData.dob !=null && this.patientData.dob !='')
      {
        const bdate = new Date(this.patientData.dob);
        const timeDiff = Math.abs(Date.now() - bdate.getTime() );
        PatientAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);

      // console.log(PatientAge);

      // var todayDate=new Date();
      // var ageyear = todayDate.getFullYear() - bdate.getFullYear();
      // var agemonth = todayDate.getMonth() - bdate.getMonth();
      // var ageday = todayDate.getDate() - bdate.getDate();
    
      // if (agemonth <= 0) {
      //   ageyear--;
      //   agemonth = (12 + agemonth);
      // }
      // // if (nowDay < dobDay) {
      // //   agemonth--;
      // //   ageday = 30 + ageday;
      // // }  
      // if (agemonth == 12) {
      //   // ageyear = ageyear + 1;
      //   agemonth = 11;
      // }
      // PatientAge =  ageyear + 'Y  ' + agemonth +'M'  ;
     
    }
    }
    //Patient
    this.strHTMLString += "<br></br> <table width='100%' class='tableMain'>" +
      "<tr >" +
      "  <th>PATIENT INFO</th>" +
      "</tr>" +
      "<tr>" +
      "  <td><table width='100%' class='tableNoBorder'>" +
      "	  <tr>" +
      "		<td width='80' align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Name:</span></td>" +
      "		<td width='300'><span  valign='top' class='styleNormal'  >" + PatientName + "</span></td>" +
      "		<td width='100' align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Address:</span></td>" +
      "		<td width='300'><span  valign='top' class='styleNormal'  >" + PatientAddress + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Gender:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + PatientGender + "</span></td>" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Home Phone:</span></td>" +
      "		<td><span  valign='top' class='styleNormal'  >" + PatientHomePhone + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Age:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + PatientAge + "</span></td>" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Cell Phone:</span></td>" +
      "		<td><span  valign='top' class='styleNormal'  >" + PatientCellPhone + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;DOB:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + PatientDOB + "</span></td>" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Email:</span></td>" +
      "		<td><span  valign='top' class='styleNormal'  >" + PatientEmail + "</span></td>" +
      "	  </tr>" +
      "	</table></td>" +
      "</tr>" +
      "</table>";

    // Provider Comments

    if (this.signed_by_requested != null && this.signed_by_requested != "") {
      this.front_page_comments_height = "420px";//"500"; //-20 more
    }
    else {
      this.front_page_comments_height = "490px";//"550";
    }



    let listconslt = new ListFilterPipe().transform(this.lstConsultType, "id", (this.inputForm.get('drpConsultType')).value);

    this.strHTMLString += "<div style='height:15px;width:100%'></div>" +
      "<table width='100%'  class='tableMain'>" +
      "<tr>" +
      "  <td valign='middle' height='30' style='padding-left:12'><span class='styleNormalBold'>Consult Type :</span><span class='styleNormal'>" + (listconslt[0].name != null ? listconslt[0].name : "") + "</span> </td>" +
      "</tr>" +
      "<tr valign='top'>" +
      "  <td>" +
      "   <table widht='100%' class='tableNoBorder'>" +
      "	    <tr>" +
      "   		<td align='left' valign='top'><span class='styleNormalBold'>Diagnosis / Comments :</span></td>" +
      "	    </tr>" +
      "	  <tr>" +
      "     <td style='height:" + this.front_page_comments_height + "' align='left' valign='top'>" +
      "	      <span class='styleNormal'>" +
      "	      <p>" + ProviderComments + "</p>" +
      "	      </span> " +
      "     </td>" +
      "   </tr>" +
      "	  </table>" +
      "  </td>" +
      "</tr>";
    debugger;
    if (this.signed_by_requested != null && this.signed_by_requested != "") {
      this.strHTMLString +=
        //"<tr>"
        //+ "<td>"
        //+ "<p>"
        //+ "<hr align='left' width='100%' size='.5'  color='#81c9e9' class='styleTopHeader'></hr>"
        //+ "</p>"
        //+ " </td> "
        //+ "</tr>"
        "<tr width='100%' align='right'>"
        + "	<td align='right' ><span class='styleNormalBold'>Electronically Signed By " + this.signed_by_requested
        //+ ((this.date_signed_requested != '') ? ("  at  " + this.date_signed_requested) : '') 
        + "</span></td>"
        + "</tr>";
    }


    this.strHTMLString += "</table>";

    this.strHTMLString += "<div style='height:15px;width=100%'></div>" +
      "<table width='100%' class='tableNoBorder' >" +
      "  <tr>" +
      "	<td><p>" +
      "	  <hr align='left' width='100%' size='.5'  color='#3399CC' class='styleTopHeader'>" +
      "	  </hr>" +
      "	  </p>" +
      "	</td>" +
      "  </tr>" +
      "  <tr>" +
      "	<td><span ><b>Confidentiality Notice:</b></span></td>" +
      "  </tr>" +
      "  <tr>" +
      "	<td>" +
      "	<span class='styleNormal'> The contents of this email/fax message and any attachments are intended solely for the addressee(s) named in this message. <br></br>" +
      "	  This communication is intended to be  and to remain confidential and may be legally privileged. If you are not the intended recipient of this message, or if this message has been addressed to you in  error, please immediately alert the sender of this email/fax and then destroy this message and its attachments. Do not deliver, distribute or copy this message and / or  any attachments if you are not the intended recipient, do not disclose the contents or take any action in reliance upon the information contained in this  communication or any attachments. </span>" +
      "	  <br></br>" +
      "	  <br></br>" +
      "	  <span class='styleNormalBold' >Failure to maintain confidentiality is strictly prohibited and subject to penalties under state and federal law.</span> </td>" +
      " </tr>" +
      "</table>";

    this.strHTMLString += "<span class='pagebreak'> </span>";

    this.strHTMLString += "<table width='100%' class='tableNoBorder'>" +
      "<tr >" +
      "  <th>PATIENT INFO</th>" +
      "</tr>" +
      "<tr>" +
      "  <td><table width='100%' class='tableNoBorder'>" +
      "	  <tr>" +
      "		<td width='80' align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Name:</span></td>" +
      "		<td width='300'><span  valign='top' class='styleNormal'  >" + PatientName + "</span></td>" +
      "		<td width='100' align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Address:</span></td>" +
      "		<td width='300'><span  valign='top' class='styleNormal'  >" + PatientAddress + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Gender:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + PatientGender + "</span></td>" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Home Phone:</span></td>" +
      "		<td><span  valign='top' class='styleNormal'  >" + PatientHomePhone + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Age:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + PatientAge + "</span></td>" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Cell Phone:</span></td>" +
      "		<td><span  valign='top' class='styleNormal'  >" + PatientCellPhone + "</span></td>" +
      "	  </tr>" +
      "	  <tr >" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;DOB:</span></td>" +
      "		<td ><span  valign='top' class='styleNormal'  >" + PatientDOB + "</span></td>" +
      "		<td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Email:</span></td>" +
      "		<td><span  valign='top' class='styleNormal'  >" + PatientEmail + "</span></td>" +
      "	  </tr>" +
      "	</table></td>" +
      "</tr>" +
      "</table>";
    debugger;
    // Patient Insurances
    this.strHTMLString += this.getInsurancesHTML();

    // Patient Medication								
    this.strHTMLString += this.getMedicationHTML()

    // Patient Allergies
    this.strHTMLString += this.getAllergiesHTML();

    if (this.strVisitsHTMLComplete != "") {
      this.strHTMLString += "<span class='pagebreak'> </span>";
      this.strHTMLString += this.strVisitsHTMLComplete;
    }

    // Get Lab Results
    this.strHTMLString += this.getLabResultsHTML();
    debugger;
    // Sincerely
    this.strHTMLString += "<div style='height:15px;width=100%'></div>" +
      "<table width='100%' >" +
      "  <tr>" +
      "	<td ><hr width='100%' size='.5'  color='#5bb6d0' class='styleTopHeader'></hr></td>" +
      " </tr>" +
      "  <tr>" +
      "	<td width='100%'><table class='tableNoBorder' >" +
      "		<tr>" +
      "			<td ><span  valign='top'  class='styleSubHeading' >&nbsp; " + ((this.inputForm.get('txtSincerely')).value == null ? '' : (this.inputForm.get('txtSincerely')).value) + "</span></td>" +
      "		</tr>" +
      "		<tr>" +
      "			<td ><span  valign='top'  class='styleSubHeading'  >&nbsp;  " + this.lookupList.practiceInfo.practiceName + "</span></td>" +
      "		</tr>" +
      "	</table>" +
      "	</td>" +
      " </tr>" +
      "</table>" +
      "</body >" +
      "</html >";
    let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");
    let footerText: string = "Patient: " + PatientName + "  |    DOB:" + PatientDOB;
    if (docPath != null && docPath.length > 0) {
      let criteria: SearchCriteria = new SearchCriteria();
      criteria.practice_id = this.lookupList.practiceInfo.practiceId;
      criteria.param_list = [
        { name: "path", value: docPath[0].upload_path, option: "" },
        { name: "footer", value: footerText, option: "" },
        { name: "html", value: this.strHTMLString, option: "" }
      ];
      debugger
      this.referralService.GenerateTempLetter(criteria).subscribe(
        data => {
          debugger;
          this.generated_pdf_url_temp = this.generalOperation.ReplaceAll((docPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/PatientDocuments/temp/" + data['result']).toString(), "\\", "/");
          this.generated_pdf_path_temp = (docPath[0].upload_path + this.lookupList.practiceInfo.practiceId + "/PatientDocuments/temp/" + data['result']).toString();//2019/05/27/456.pdf
          this.generated_pdf_url_link = data['result'];

          const modalRef = this.ngbModal.open(ReferralViewersComponent, this.lgPopUpOptions);
          modalRef.componentInstance.path_doc = this.generated_pdf_url_temp;//docPath[0].download_path+this.lookupList.practiceInfo.practiceId+"\\PatientDocuments\\temp\\"+data['result'];
          modalRef.componentInstance.width = '800px';
          let closeResult;
          modalRef.result.then((result) => {
            if (result != '') {
              this.isProcessing = false;
              this.referral_View_Operation = result;
              if (result == "SAVE") {
                this.OnSave();
              }
              else if (result == "SAVEFAX") {
                debugger;
                this.OnSave();
              }
              else if (result == "SAVEDOWNLOAD") {
                let searchCriteria: SearchCriteria = new SearchCriteria;
                searchCriteria.criteria = this.generated_pdf_path_temp;
                this.generalService.downloadFile(searchCriteria)
                  .subscribe(
                    data => {
                      debugger;
                      this.downloafileResponse(data, this.generated_pdf_url_temp);
                    },
                    error => alert(error)
                  );

                this.OnSave();
              }
            }
          }, (reason) => {
            this.isProcessing = false;
          });
        },
        error => {
          this.isProcessing = false;
          error => alert(error);
        }
      );
    }
  }


  getInsurancesHTML(): String {
    let strInsuranceHTML = "";
    let strPrimary = "";
    let strSecondary = "";
    let strOther = "";
    let name = "";
    let address = "";
    let policy_no = "";
    let guarantor = "";
    let relationship = "";

    if (this.acInsurances != null && this.acInsurances.length > 0) {
      let listTemp = new ListFilterPipe().transform(this.acInsurances, "insurace_type", "PRIMARY");

      if (listTemp != null && listTemp.length > 0) {
        name = listTemp[0].name;
        address = ((listTemp[0].insurance_address == null || listTemp[0].insurance_address == "") ? "" : listTemp[0].insurance_address) + " " + ((listTemp[0].insurance_city == null || listTemp[0].insurance_city == "") ? "" : listTemp[0].insurance_city) + " , " + ((listTemp[0].insurance_state == null || listTemp[0].insurance_state == "") ? "" : listTemp[0].insurance_state) + " " + ((listTemp[0].insurance_zip == null || listTemp[0].insurance_zip == "") ? "" : listTemp[0].insurance_zip);
        policy_no = (listTemp[0].policy_number == null || listTemp[0].policy_number == "") ? "" : listTemp[0].policy_number;
        guarantor = (listTemp[0].guarantor_name == null || listTemp[0].guarantor_name == "") ? "" : listTemp[0].guarantor_name;
        relationship = (listTemp[0].guarantor_relationship == null || listTemp[0].guarantor_relationship == "") ? "" : listTemp[0].guarantor_relationship;

        if (guarantor != "") {
          guarantor += " (" + relationship + ")";
        }
        else {
          guarantor = relationship;
        }

        strPrimary = "<div style='height:10px;width=100%'></div>" +
          "<table width='100%' class='tableNoBorder'>" +
          "  <tr >" +
          "	<th>PRIMARY INSURANCE</th>" +
          "  </tr>" +
          "  <tr>" +
          "	<td><table width='100%' class='tableNoBorder'>" +
          "		<tr>" +
          "		  <td width='80' align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Name:</span></td>" +
          "		  <td width='100%'><span  valign='top' class='styleNormal'  >" + name + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Address:</span></td>" +
          "		  <td ><span  valign='top' class='styleNormal'  >" + address + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Policy No:</span></td>" +
          "		  <td ><span  valign='top' class='styleNormal'  >" + policy_no + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Guarantor:</span></td>" +
          "		  <td width='100%'><span  valign='top' class='styleNormal'  >" + guarantor + "</span></td>" +
          "		</tr>" +
          "	 </table>" +
          "  </td>" +
          "</tr>" +
          "</table>";
      }

      listTemp = new ListFilterPipe().transform(this.acInsurances, "insurace_type", "SECONDARY");
      if (listTemp != null && listTemp.length > 0) {
        name = listTemp[0].name;
        address = ((listTemp[0].insurance_address == null || listTemp[0].insurance_address == "") ? "" : listTemp[0].insurance_address) + " " + ((listTemp[0].insurance_city == null || listTemp[0].insurance_city == "") ? "" : listTemp[0].insurance_city) + " , " + ((listTemp[0].insurance_state == null || listTemp[0].insurance_state == "") ? "" : listTemp[0].insurance_state) + " " + ((listTemp[0].insurance_zip == null || listTemp[0].insurance_zip == "") ? "" : listTemp[0].insurance_zip);
        policy_no = (listTemp[0].policy_number == null || listTemp[0].policy_number == "") ? "" : listTemp[0].policy_number;
        guarantor = (listTemp[0].guarantor_name == null || listTemp[0].guarantor_name == "") ? "" : listTemp[0].guarantor_name;
        relationship = (listTemp[0].guarantor_relationship == null || listTemp[0].guarantor_relationship == "") ? "" : listTemp[0].guarantor_relationship;

        if (guarantor != "") {
          guarantor += " (" + relationship + ")";
        }
        else {
          guarantor = relationship;
        }

        strSecondary = "<div style='height:10px;width=100%'></div>" +
          "<table width='100%' class='tableNoBorder'>" +
          "  <tr >" +
          "	<th>SECONDARY INSURANCE</th>" +
          "  </tr>" +
          "  <tr>" +
          "	<td><table width='100%' class='tableNoBorder'>" +
          "		<tr>" +
          "		  <td width='80' align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Name:</span></td>" +
          "		  <td width='100%'><span  valign='top' class='styleNormal'  >" + name + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Address:</span></td>" +
          "		  <td ><span  valign='top' class='styleNormal'  >" + address + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Policy No:</span></td>" +
          "		  <td ><span  valign='top' class='styleNormal'  >" + policy_no + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Guarantor:</span></td>" +
          "		  <td width='100%'><span  valign='top' class='styleNormal'  >" + guarantor + "</span></td>" +
          "		</tr>" +
          "	 </table>" +
          "  </td>" +
          "</tr>" +
          "</table>";
      }
      listTemp = new ListFilterPipe().transform(this.acInsurances, "insurace_type", "OTHER");
      if (listTemp != null && listTemp.length > 0) {
        name = listTemp[0].name;
        address = ((listTemp[0].insurance_address == null || listTemp[0].insurance_address == "") ? "" : listTemp[0].insurance_address) + " " + ((listTemp[0].insurance_city == null || listTemp[0].insurance_city == "") ? "" : listTemp[0].insurance_city) + " , " + ((listTemp[0].insurance_state == null || listTemp[0].insurance_state == "") ? "" : listTemp[0].insurance_state) + " " + ((listTemp[0].insurance_zip == null || listTemp[0].insurance_zip == "") ? "" : listTemp[0].insurance_zip);
        policy_no = (listTemp[0].policy_number == null || listTemp[0].policy_number == "") ? "" : listTemp[0].policy_number;
        guarantor = (listTemp[0].guarantor_name == null || listTemp[0].guarantor_name == "") ? "" : listTemp[0].guarantor_name;
        relationship = (listTemp[0].guarantor_relationship == null || listTemp[0].guarantor_relationship == "") ? "" : listTemp[0].guarantor_relationship;


        if (guarantor != "") {
          guarantor += " (" + relationship + ")";
        }
        else {
          guarantor = relationship;
        }

        strOther = "<div style='height:10px;width=100%'></div>" +
          "<table width='100%' class='tableNoBorder'>" +
          "  <tr >" +
          "	<th>OTHER INSURANCE</th>" +
          "  </tr>" +
          "  <tr>" +
          "	<td><table width='100%' class='tableNoBorder'>" +
          "		<tr>" +
          "		  <td width='80' align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Name:</span></td>" +
          "		  <td width='100%'><span  valign='top' class='styleNormal'  >" + name + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Address:</span></td>" +
          "		  <td ><span  valign='top' class='styleNormal'  >" + address + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Policy No:</span></td>" +
          "		  <td ><span  valign='top' class='styleNormal'  >" + policy_no + "</span></td>" +
          "		</tr>" +
          "		<tr>" +
          "		  <td align='left' ><span  valign='top' class='styleNormalBold'  >&nbsp;&nbsp;Guarantor:</span></td>" +
          "		  <td width='100%'><span  valign='top' class='styleNormal'  >" + guarantor + "</span></td>" +
          "		</tr>" +
          "	 </table>" +
          "  </td>" +
          "</tr>" +
          "</table>";
      }

      strInsuranceHTML = strPrimary + strSecondary + strOther;

    }

    return strInsuranceHTML;
  }
  getMedicationHTML(): String {

    let strMedicaiton = "";

    let strCurrentMedication = "";
    let strPreviousMedication = "";

    strMedicaiton = "<div style='height:10px;width=100%'></div>" +
      "<table width='100%' class='tableMain'>  " +
      "  <tr>" +
      "	<th>Medication:</th>" +
      "  </tr>" +
      "  <tr>" +
      "  <td>" +
      "	  <table width='100%' class='tableNoBorder' >";

    if (this.acMedication != null && this.acMedication.length > 0) {
      var nume_current = 1;
      var nume_previous = 1;

      for (let i = 0; i < this.acMedication.length; i++) {
        if (this.acMedication[i].archive == "N") {
          strCurrentMedication += "<tr>" +
            "<td width='25'><span class='styleNormal'>" + nume_current + "</span></td>" +
            "<td width='80'><span class='styleNormal'>" + this.acMedication[i].start_date + "</span></td>" +
            "<td width='100%' valign='top'><span class='styleNormalBold'>" + this.generalOperation.ReplaceAll(this.generalOperation.ReplaceAll(this.acMedication[i].drug_info, "<", "&lt;"), ">", "&gt;") + "</span><span class='styleNormal'> " + this.generalOperation.ReplaceAll(this.generalOperation.ReplaceAll(this.acMedication[i].sig_text, "<", "&lt;"), ">", "&gt;") + "</span></td>" +
            "</tr>  ";

          nume_current++;
        }
        else if (this.acMedication[i].archive == "Y") {
          strPreviousMedication += "<tr>" +
            "<td width='25'><span class='styleNormal'>" + nume_previous + "</span></td>" +
            "<td width='80'><span class='styleNormal'>" + this.acMedication[i].start_date + "</span></td>" +
            "<td valign='top'><span class='styleNormalBold'>" + this.generalOperation.ReplaceAll(this.generalOperation.ReplaceAll(this.acMedication[i].drug_info, "<", "&lt;"), ">", "&gt;") + "</span><span class='styleNormal'> " + this.generalOperation.ReplaceAll(this.generalOperation.ReplaceAll(this.acMedication[i].sig_text, "<", "&lt;"), ">", "&gt;") + "</span></td>" +
            "</tr>  ";

          nume_previous++;
        }
      }
      if (strCurrentMedication != null && strCurrentMedication != "") {
        strCurrentMedication = " <tr >"
          + "		  <td colspan='3' ><span class='styleSubHeading'><U>CURRENT MEDICATION:</U></span></td>"
          + "		</tr>"
          + strCurrentMedication;
      }

      if (strPreviousMedication != null && strPreviousMedication != "") {
        strPreviousMedication = " <tr >"
          + "		  <td colspan='3' ><span class='styleSubHeading'><U>PREVIOUS MEDICATION:</U></span></td>"
          + "		</tr>"
          + strPreviousMedication;
      }
    }

    var no_med: String = "";
    if (strCurrentMedication == "" && strPreviousMedication == "") {
      strMedicaiton += "<tr><td><span style='styleNormal'>Patient has no Medication</span></td></tr>";
    }
    else {
      strMedicaiton += strCurrentMedication + strPreviousMedication;
    }

    strMedicaiton += "</table></td></tr></table>";
    return strMedicaiton;
  }
  getAllergiesHTML(): String {

    let strAllergies = "";

    let strCurrentAllergies = "";

    strAllergies = "<div style='height:10px;width=100%'></div>" +
      "<table width='100%' class='tableMain'>  " +
      "  <tr>" +
      "	<th >Drug Allergies:</th>" +
      "  </tr>" +
      "  <tr>" +
      "  <td>" +
      "	  <table width='100%' class='tableNoBorder' >";

    if (this.acAllergies != null && this.acAllergies.length > 0) {

      var num = 1;

      for (let i = 0; i < this.acAllergies.length; i++) {
        if (this.acAllergies[i].status == "A") {
          strCurrentAllergies += "<tr>" +
            "<td width='20' valign='top'><span class='styleNormal'>" + num + ".</span></td>" +
            "<td width='80' valign='top'><span class='styleNormal'>" + this.acAllergies[i].alergy_date + "</span></td>" +
            "<td width='100%' valign='top'><span class='styleNormalBold'>" + this.acAllergies[i].description + "</span></td>" +
            "</tr>  ";
          num++;
        }
      }
    }

    var no_Allergy: String = "";
    if (strCurrentAllergies == "") {
      strAllergies += "<tr><td><span style='styleNormal'>Patient has no known Allergies</span></td></tr>";
    }
    else {
      strAllergies += strCurrentAllergies;
    }

    strAllergies += "</table></td></tr></table>";

    return strAllergies;
  }
  getLabResultsHTML(): String {

    if (this.lstlab == null || this.lstlab.length == 0)
      return "";
    if (this.acLabResults == null || this.acLabResults.length == 0)
      return "";
    var strLabResults: String = "";

    for (let i = 0; i < this.lstlab.length; i++) {
      if (this.lstlab[i].chkbx == true) {
        var strTestID: String = "";
        var strTestHTML: String = "";

        for (let j = 0; j < this.acLabResults.length; j++) {
          {
            if (strTestID != this.acLabResults[j].test_id) {

              strTestID = this.acLabResults[j].test_id;

              if (strLabResults != "") {
                strLabResults += "<tr><td colspan='7' height='10'></td> </tr>";
              }

              strLabResults += "<tr>" +
                "	<th colspan='7' class='styleNormalBold'>" + this.lstlab[i].order_date + "&nbsp;&nbsp;&nbsp;&nbsp;" + this.acLabResults[j].test_description + " ( " + this.acLabResults[j].test_code + "):</th>" +
                "</tr>" +
                "<tr>" +
                "	<th class='styleNormalBold' valign='top' width='80'>Date</th>" +
                "	<th class='styleNormalBold' valign='top' width='80'>Code</th>" +
                "	<th class='styleNormalBold' valign='top' width='220'>Description</th>" +
                "	<th class='styleNormalBold' valign='top' width='300'>Result</th>" +
                "	<th class='styleNormalBold' valign='top' width='100'>Ref.range</th>" +
                "	<th class='styleNormalBold' valign='top' width='60'>Flag</th>" +
                "	<th class='styleNormalBold' valign='top' width='60'>Status</th>" +
                "</tr>	";
            }

            strLabResults += "<tr>" +
              "	<td class='styleNormal' valign='top'>" + this.acLabResults[j].observation_date + "</td>" +
              "	<td class='styleNormal' valign='top'>" + this.acLabResults[j].result_code + "</td>" +
              " <td class='styleNormal' valign='top'>" + this.generalOperation.ReplaceHTMLReservedWords(this.acLabResults[j].result_description) + "</td>" +
              " <td class='styleNormal' valign='top'>" + this.generalOperation.ReplaceHTMLReservedWords(this.acLabResults[j].result_value) + "</td>" +
              "	<td class='styleNormal' valign='top'>" + this.generalOperation.ReplaceHTMLReservedWords(this.acLabResults[j].recomended_value) + "</td>" +
              "	<td class='styleNormal' valign='top'>" + this.generalOperation.ReplaceHTMLReservedWords(this.acLabResults[j].abnormal_range_code) + "</td>" +
              "	<td class='styleNormal' valign='top'>" + this.generalOperation.ReplaceHTMLReservedWords(this.acLabResults[j].result_status_code) + "</td>" +
              "</tr>";
          }
        }
      }
    }
    if (strLabResults != "") {
      strLabResults = "<span class='pagebreak'> </span>" +
        "<table width='100%' class='tableMain'>" +
        "<tbody  >" +
        "	  <tr class='styleModuleSubHeader'>" +
        "		<td  height='30' ><span class='styleSubHeading'>LAB RESULTS</span></td>" +
        "	</tr>" +
        "	<tr>" +
        "		<td>" +
        "			<table width='100%' class='tableNoBorder'>" +
        "				<tbody>" +
        strLabResults +
        "				</tbody> " +
        "			</table>" +
        "		</td>" +
        "	</tr>" +
        "</tbody>" +
        "</table>";
    }
    return strLabResults;

  }
  onFaxAttachmentView(pat) {
    let docPath = this.generalOperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "PatientDocuments");

    this.generated_pdf_url_temp = this.generalOperation.ReplaceAll((docPath[0].download_path + this.lookupList.practiceInfo.practiceId + "/PatientDocuments/" + pat.doc_link).toString(), "\\", "/");
    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = this.generated_pdf_url_temp;
    modalRef.componentInstance.width = '800px';
  }



  //showFax = false;
  onFax(refId: string, docLink: string) {

    let faxParam: FaxParam = new FaxParam();
    faxParam.moduleReferenceId = refId;
    faxParam.recepientOrganization = "";
    faxParam.recepientName = this.refPhyName;// (this.inputForm.get('txtReferTo')).value;
    faxParam.recepientFaxNo = this.refPhyFax;// (this.inputForm.get('txtFax')).value;
    faxParam.recepientPhone = this.refPhyPhone;// (this.inputForm.get('txtPhone')).value;
    faxParam.patientId = this.patientId;


    let lstFaxAttachments = new Array<any>();
    let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient();
    sendFaxAttachmentsFromClient.read_only = true;
    sendFaxAttachmentsFromClient.document_source = FaxAttachemntsTypeEnum.REFERENCED_DOCUMENT;
    sendFaxAttachmentsFromClient.document_name = "Referral_" + refId + ".pdf";
    sendFaxAttachmentsFromClient.document_link = docLink;//this.generated_pdf_url_link;
    lstFaxAttachments.push(sendFaxAttachmentsFromClient);

    this.openSendFaxPopUp("Send Fax", lstFaxAttachments, "new_fax", faxParam);

  }

  onFaxFromGrid(ref: any) {
    /*
    let strLink = "";
    strLink = this.config.flexApplink;
    strLink += "user_id=" + this.lookupList.logedInUser.userId;
    strLink += "&user_name=" + this.lookupList.logedInUser.user_name;
    strLink += "&practice_id=" + this.lookupList.practiceInfo.practiceId;
    strLink += "&calling_from=referral";
    strLink += "&referal_id=" + id;
    strLink += "&patient_id=" + this.patientId;
  
    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.lgPopupUpOptions);
    modalRef.componentInstance.path_doc = strLink;
    modalRef.componentInstance.width = '800px';
    */

    debugger;
    let faxParam: FaxParam = new FaxParam();
    faxParam.moduleReferenceId = ref.referral_id;
    faxParam.recepientOrganization = "";
    faxParam.recepientName = ref.referral_provider_name;
    faxParam.recepientFaxNo = ref.referral_provider_fax;
    faxParam.recepientPhone = ref.referral_provider_phone;
    faxParam.patientId = this.patientId;


    let lstFaxAttachments = new Array<any>();
    let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient();
    sendFaxAttachmentsFromClient.read_only = true;
    sendFaxAttachmentsFromClient.document_source = FaxAttachemntsTypeEnum.REFERENCED_DOCUMENT;
    sendFaxAttachmentsFromClient.document_name = "Referral_" + ref.referral_id + ".pdf";
    sendFaxAttachmentsFromClient.document_link = ref.referral_path;
    lstFaxAttachments.push(sendFaxAttachmentsFromClient);

    this.openSendFaxPopUp("Send Fax", lstFaxAttachments, "new_fax", faxParam);
  }
  /*
  current_url: SafeUrl;
  updateSrc(url) {
    this.current_url = this.domSanitizer.bypassSecurityTrustResourceUrl(url)
  }
  
  navigateBackFromFax() {
    this.showFax = false;
  }
  */
  onFaxResend(sentFax: any) {


    if (sentFax.fax_status.toString().toLowerCase() == 'pending') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Resend Fax', "Selected Fax is already in the queue.", AlertTypeEnum.WARNING)
    }
    else {
      let faxParam: FaxParam = new FaxParam();

      faxParam.faxSubject = sentFax.subject;
      faxParam.faxNotes = sentFax.cover_page_comments;
      faxParam.faxNotes = sentFax.cover_page_comments;

      faxParam.recepientOrganization = sentFax.receiver_organization;
      faxParam.recepientName = sentFax.receiver_name;
      faxParam.recepientFaxNo = sentFax.receiver_no;
      faxParam.recepientPhone = sentFax.receiver_phone;


      faxParam.senderOrganization = sentFax.sender_organization;
      faxParam.senderName = sentFax.sender_name;
      faxParam.senderFaxNo = sentFax.sender_no;
      faxParam.senderPhone = sentFax.sender_phone;

      faxParam.patientId = sentFax.patient_id;
      faxParam.moduleReferenceId = sentFax.module_reference_id;
      faxParam.faxReferenceId = sentFax.fax_reference_id;

      let faxSentId: string = '';

      if (sentFax.fax_sent_id_main != undefined
        && sentFax.fax_sent_id_main != null
        && sentFax.fax_sent_id_main != '') {
        faxSentId = sentFax.fax_sent_id_main;
      }
      else {
        faxSentId = sentFax.fax_sent_id;
      }
      faxParam.faxSentId = Number(faxSentId);


      let lstFaxAttachments = new Array<any>();
      if (this.lstSentFaxAttachments != undefined && this.lstSentFaxAttachments.length > 0) {
        this.lstSentFaxAttachments.forEach(att => {
          let sendFaxAttachmentsFromClient: SendFaxAttachmentsFromClient = new SendFaxAttachmentsFromClient();
          sendFaxAttachmentsFromClient.read_only = true;
          sendFaxAttachmentsFromClient.document_source = FaxAttachemntsTypeEnum.REFERENCED_DOCUMENT;
          sendFaxAttachmentsFromClient.document_name = att.doc_name;
          sendFaxAttachmentsFromClient.document_link = att.doc_link;
          lstFaxAttachments.push(sendFaxAttachmentsFromClient);
        });

      }

      this.openSendFaxPopUp("Resend Fax", lstFaxAttachments, "resend_fax", faxParam);
    }
  }

  openSendFaxPopUp(title: string, lstAttachment: Array<SendFaxAttachmentsFromClient>, faxOption: string, faxParam: FaxParam) {

    const modalRef = this.ngbModal.open(NewFaxComponent, this.lgPopUpOptions);

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.lstAttachments = lstAttachment;
    modalRef.componentInstance.callingFrom = "referral";
    modalRef.componentInstance.operation = faxOption;
    modalRef.componentInstance.faxParam = faxParam;

    modalRef.result.then((result) => {
      if (result) {
        this.OnCancel();
        this.onGetReferral();
      }
    }, (reason) => {

    });
  }

  updateFaxStatus(fax: any) {

    if (fax.fax_status.toString().toLowerCase() == 'success') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Fax Status', "Fax Status is 'Success'.", AlertTypeEnum.INFO)
      return;
    }
    else {
      let criteria: SearchCriteria = new SearchCriteria();
      criteria.practice_id = this.lookupList.practiceInfo.practiceId;
      criteria.param_list = [
        { name: "clientDateTime", value: this.dateTimeUtil.getCurrentDateTimeString() },
        { name: "logedInUser", value: this.lookupList.logedInUser.user_name },
        { name: "systemIp", value: this.lookupList.logedInUser.systemIp },
        { name: "faxSentIds", value: fax.fax_sent_id }
      ];

      this.faxService.updateFaxSendingStatus(criteria).subscribe(
        data => {
          this.updateFaxStatusSuccess(data);
        },
        error => {
          this.updateFaxStatusError(error);
        }
      );
    }
  }

  updateFaxStatusSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.getFaxDetail(this.rowId);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Update Fax Status', data.response, AlertTypeEnum.DANGER)
    }
  }

  updateFaxStatusError(error: any) {
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Update Fax Status', "An Error Occured while sending Fax.", AlertTypeEnum.DANGER)
  }
  onEditReferral(ref) {
    debugger;
    this.dashboardAddEdit = true;
    //this.inputForm.reset();
    this.operation = 'Edit';
    this.isReadonly = false;
    this.inputForm.reset();
    this.isSearchReferral = false;
    this.referral_id = '';

    this.selectedReferral = ref;

    if (ref.provider_id != null && ref.provider_id != "")
      (this.inputForm.get('drpProvider') as FormControl).setValue(ref.provider_id);
    if (ref.location_id != null && ref.location_id != "")
      (this.inputForm.get('drpLocation') as FormControl).setValue(ref.location_id);
    if (ref.consult_type_id != null && ref.consult_type_id != '')
      (this.inputForm.get('drpConsultType') as FormControl).setValue(ref.consult_type_id);
    if (ref.referral_provider_id != null && ref.referral_provider_id != "")
      this.referral_id = ref.referral_provider_id;
    if (ref.referral_provider_name != null && ref.referral_provider_name != '')
      this.refPhyName = ref.referral_provider_name;
    //(this.inputForm.get('txtProvider') as FormControl).setValue(ref.referral_provider_name);
    if (ref.referral_provider_address != null && ref.referral_provider_address != '')
      this.refPhyAddress = ref.referral_provider_address;
    //(this.inputForm.get('txtAddress') as FormControl).setValue(ref.referral_provider_address);
    if (ref.referral_provider_phone != null && ref.referral_provider_phone != '')
      this.refPhyPhone = ref.referral_provider_phone;
    //(this.inputForm.get('txtPhone') as FormControl).setValue(ref.referral_provider_phone);
    if (ref.referral_provider_fax != null && ref.referral_provider_fax != '')
      this.refPhyFax = ref.referral_provider_fax;
    //(this.inputForm.get('txtFax') as FormControl).setValue(ref.referral_provider_fax);
    if (ref.referral_provider_email != null && ref.referral_provider_email != '')
      this.refPhyEmail = ref.referral_provider_email;
    //(this.inputForm.get('txtEmail') as FormControl).setValue(ref.referral_provider_email);
    if (ref.referral_reason != null && ref.referral_reason != '')
      (this.inputForm.get('txtComments') as FormControl).setValue(ref.referral_reason);

    (this.inputForm.get('txtSincerely') as FormControl).setValue("Thank you for Assisting our patient.");

    if (ref.signed_by != null && ref.signed_by != "") {
      this.inputForm.get('txtSignedBy').disable();
      (this.inputForm.get('txtSignedBy') as FormControl).setValue(ref.signed_by + " at " + ref.date_signed);
      this.signed_by_requested = ref.signed_by + ' at ' + ref.date_signed;
      //this.date_signed_requested = ref.date_signed;

      this.inputForm.get('drpProvider').disable();
      this.inputForm.get('drpLocation').disable();
    }
    else {
      this.inputForm.get('txtSignedBy').disable();
      (this.inputForm.get('txtSignedBy') as FormControl).setValue("");
      this.inputForm.get('drpProvider').enable();
      this.inputForm.get('drpLocation').enable();
      this.signed_by_requested = "";
      //this.date_signed_requested = "";
    }
  }
  onReferralSearchKeydown(value) {
    if (value.length > 2) {
      this.isSearchReferral = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
      searchCriteria.param_list = [
        // { name: "criteria", value: this.inputForm.get("drpConsultType").value, option: "Consult_criteria" }];
        { name: "search_value", value: value, option: "" }];

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
    else {
      this.isSearchReferral = false;
    }
  }

  drpProvider_changed(event: any) {
    debugger;

    let proId: any = (this.inputForm.get("drpProvider").value);

    for (var i: number = 0; i < this.lookupList.providerList.length; i++) {

      if (proId == this.lookupList.providerList[i].id) {
        this.signed_by_requested = this.lookupList.providerList[i].name;
        (this.inputForm.get('txtSignedBy') as FormControl).setValue(this.signed_by_requested);
        break;
      }
    }
  }
}


// search() {
//   debugger;
//   this.isLoading = true;
//   this.lstRefPhysician = undefined;
//   if(this.refConsultlist!=null)
//   {
//     this.lstRefPhysician = this.refConsultlist;
//     this.isLoading = false;
//     return;
//   }
//   let searchCriteria: SearchCriteria = new SearchCriteria();
//   searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
//   searchCriteria.param_list = [
//     { name: "search_value", value: this.searchValue, option: "" }
//   ];


//   this.searchService.searchRefPhysician(searchCriteria).subscribe(
//     data => {
//       debugger;
//       this.lstRefPhysician = data as Array<any>;
//       this.isLoading = false;
//     },
//     error => {
//       this.onSearchError(error);
//       this.isLoading = false;
//     }
//   );

// }