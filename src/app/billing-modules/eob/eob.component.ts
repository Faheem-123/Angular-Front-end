import { Component, OnInit, Inject, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { BillingService } from 'src/app/services/billing/billing.service';
import { SortFilterPaginationService, NgbdSortableHeader, SortEvent, SortFilterPaginationResult } from 'src/app/services/sort-filter-pagination.service';
import { OpenModuleService } from 'src/app/services/general/openModule.service';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { GeneralService } from 'src/app/services/general/general.service';
import { DocumentViewerComponent } from 'src/app/general-modules/document-viewer/document-viewer.component';
import * as FileSaver from 'file-saver';
import { ORMEOBSave } from 'src/app/models/billing/ORMEOBSave';
import { ORMEobAttachments } from 'src/app/models/billing/ORMEobAttachments';
import { PromptResponseEnum, AlertTypeEnum, ServiceResponseStatusEnum, CallingFromEnum } from 'src/app/shared/enum-util';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';
import { ORMDeleteRecord } from 'src/app/models/general/orm-delete-record';
import { AlertPopupComponent } from 'src/app/general-modules/alert-popup/alert-popup.component';
import { ClaimPostedPaymentDetailsComponent } from '../payment/claim-posted-payment-details/claim-posted-payment-details.component';
import { EOBPatientPaymentComponent } from '../payment/eobpatient-payment/eobpatient-payment.component';
import { PatientToOpen } from 'src/app/models/common/patientToOpen';
import { AddEditEobComponent } from './add-edit-eob/add-edit-eob.component';
import { InlinePayerSearchComponent } from 'src/app/general-modules/inline-payer-search/inline-payer-search.component';
@Component({
  selector: 'eob',
  templateUrl: './eob.component.html',
  styleUrls: ['./eob.component.css']
})
export class EobComponent implements OnInit {

  @Input() callingFrom: CallingFromEnum;
  @Input() eobIdSearch: number;

  @ViewChild('inlinePatientSearch') inlinePatientSearch: InlinePatientSearchComponent;
  @ViewChild('inlinePayerSearch') inlinePayerSearch: InlinePayerSearchComponent;

  //@ViewChild('inlineSearchEOBPatient') inlineSearchEOBPatient: InlinePatientSearchComponent;

  closeResult: string;
  searchFormGroup: FormGroup;
  //inputForm: FormGroup;
  listEOB;
  listEOBDb;
  listEOBAttachment;
  isLoading: boolean = false;
  isProcessing: boolean = false;
  //operation = 'New';
  //docRemove = false;
  is_Billing;
  //@ViewChild('inlineSearchDenialInsurance') inlineSearchDenialInsurance: InlineInsuranceSearchComponent;

  dateRangeType: string = 'filing_date';  // filing_date|check_date

  payerIdSearched = ''
  payerNameSearched: string = '';

  patientIdSearched = ''
  patientNameSearched: string = '';

  constructor(@Inject(LOOKUP_LIST) public lookupList: LookupList, private dateTimeUtil: DateTimeUtil, private generaloperation: GeneralOperation,
    private formBuilder: FormBuilder, private ngbModal: NgbModal, private billingService: BillingService,
    private openModuleService: OpenModuleService, private sortFilterPaginationService: SortFilterPaginationService
    , private generalService: GeneralService, private generalOperation: GeneralOperation) { }

  open(content) {
    this.ngbModal.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit() {
    if (this.lookupList.logedInUser.userType.toUpperCase() == "BILLING") {
      this.is_Billing = true;
    }
    if (this.callingFrom == CallingFromEnum.CLAIM_PAYMENT || this.callingFrom == CallingFromEnum.DENIAL) {
      this.searchEOBByID();
    }
    else {
      this.buildForm();
    }

    if (this.lookupList.lstdocumentPath != undefined && this.lookupList.lstdocumentPath.length > 0) {
      let lstDocPath = this.generaloperation.filterArray(this.lookupList.lstdocumentPath, "category_name", "EOB");
      if (lstDocPath.length > 0) {
        this.downloadPath = lstDocPath[0].upload_path + "//" + this.lookupList.practiceInfo.practiceId + "//EOB";
      }
      else {
        this.downloadPath = '';
      }
    }
  }

  onDateTypeChange(type: string) {
    this.dateRangeType = type;
  }


  searchEOBByID() {

    this.isLoading = true;

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "eob_id", value: this.eobIdSearch, option: "" });

    this.getEOB();
  }

  buildForm() {
    this.searchFormGroup = this.formBuilder.group({
      dateRangeType: this.formBuilder.control(this.dateRangeType),
      dpFrom: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      dpTo: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      txtPayerSearch: this.formBuilder.control(''),
      txtPatientSearch: this.formBuilder.control(""),

      txtEOBId: this.formBuilder.control(''),
      txtCheckNo: this.formBuilder.control(""),

      ddPaymentType: this.formBuilder.control("EOB"),
      //ddStatus: this.formBuilder.control('All'),
      chkPending: this.formBuilder.control(true),
      chkPosted: this.formBuilder.control(false),
      chkAttorney: this.formBuilder.control(false),
      chkDeleted: this.formBuilder.control(false)
    });
    /*
      this.inputForm = this.formBuilder.group({
        chkPayment: this.formBuilder.control('check'),
        txtFillingDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
        txtCheckDate: this.formBuilder.control(''),
        txtCheckNo: this.formBuilder.control(''),
        txttotalAmount: this.formBuilder.control(''),
        txtpaymentType: this.formBuilder.control('EOB'),
        txtPaySearch: this.formBuilder.control(''),
        txtPatSearch: this.formBuilder.control(''),
        txtFile: this.formBuilder.control(null, this.operation == "Edit" ? null : Validators.required),
      })
      */
  }
  showPatientSearch = false;

  onPatientSearchInputChange(newValue) {

    if (newValue !== this.patientNameSearched) {
      this.patientIdSearched = undefined;
    }

  }

  onPatientSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatientSearch = true;
    }
    else if (event.key == 'ArrowDown') {
      debugger;
      this.shiftFocusToPatSearch();
    }
    else {
      this.showPatientSearch = false;
    }
  }
  shiftFocusToPatSearch() {
    this.inlinePatientSearch.focusFirstIndex();
  }

  openSelectPatient(patObject) {
    this.patientIdSearched = patObject.patient_id;
    this.searchFormGroup.get("txtPatientSearch").setValue(patObject.name);
    this.showPatientSearch = false;
  }
  closePatientSearch() {
    this.showPatientSearch = false;
    this.onPatientSearchBlur();
  }
  onPatientSearchBlur() {
    if ((this.patientIdSearched == undefined || this.patientIdSearched == '') && this.showPatientSearch == false) {
      this.patientNameSearched = '';
      this.searchFormGroup.get("txtPatientSearch").setValue('');
    }
  }
  showPayerSearch = false;


  onPayerSearchInputChange(newValue) {

    if (newValue !== this.payerNameSearched) {
      this.payerIdSearched = undefined;
    }

  }

  onPayerSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayerSearch = true;
    }
    else if (event.key == 'ArrowDown') {
      debugger;
      this.shiftFocusToPayerSearch();
    }
    else {
      this.showPayerSearch = false;
    }

  }
  shiftFocusToPayerSearch() {
    this.inlinePayerSearch.focusFirstIndex();
  }
  openSelectPayer(patObject) {
    debugger;
    this.payerIdSearched = patObject.payerid;
    this.payerNameSearched = patObject.name + " (" + patObject.payer_number + ")";

    (this.searchFormGroup.get('txtPayerSearch') as FormControl).setValue(this.payerNameSearched);

    this.showPayerSearch = false;
  }
  closePayerSearch() {
    this.showPayerSearch = false;
    this.onPayerSearchBlur();
  }
  onPayerSearchBlur() {
    if ((this.payerIdSearched == undefined || this.payerIdSearched == '') && this.showPayerSearch == false) {
      this.payerIdSearched = '';
      this.payerNameSearched = '';
      this.searchFormGroup.get("txtPayerSearch").setValue(null);
    }
  }
  searchCriteria: SearchCriteria;
  searchEOB(frm: any) {
    debugger;
    if ((this.searchFormGroup.get('dpFrom') as FormControl).value == "" || (this.searchFormGroup.get('dpFrom') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter From Date", 'warning')
      return;
    }
    if ((this.searchFormGroup.get('dpTo') as FormControl).value == "" || (this.searchFormGroup.get('dpTo') as FormControl).value == null) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please Enter To Date", 'warning')
      return;
    }
    if (frm.chkDeleted == false && frm.chkPending == false && frm.chkPosted == false) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Select at least one option from Pending, Posted or Deleted.", 'warning')
      return;
    }
    this.isLoading = true;

    this.searchCriteria = new SearchCriteria()
    this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    this.searchCriteria.criteria = '';
    this.searchCriteria.option = '';
    this.searchCriteria.param_list = [];
    this.searchCriteria.param_list.push({ name: "date_type", value: this.dateRangeType, option: "" });
    this.searchCriteria.param_list.push({ name: "check_number", value: frm.txtCheckNo, option: "" });
    this.searchCriteria.param_list.push({ name: "eob_id", value: frm.txtEOBId, option: "" });
    if (this.payerIdSearched != '' && frm.txtPayerSearch != null && frm.txtPayerSearch != '') {
      this.searchCriteria.param_list.push({ name: "payer_id", value: this.payerIdSearched, option: "" });
    }
    else
      this.searchCriteria.param_list.push({ name: "payer_id", value: "", option: "" });
    if (this.patientIdSearched != '' && frm.txtPatientSearch != null && frm.txtPatientSearch != '') {
      this.searchCriteria.param_list.push({ name: "patient_id", value: this.patientIdSearched, option: "" });
    }
    else
      this.searchCriteria.param_list.push({ name: "patient_id", value: "", option: "" });

    //  this.searchCriteria.param_list.push({ name: "status", value: frm.ddStatus, option: "" });

    this.searchCriteria.param_list.push({ name: "chk_pending", value: frm.chkPending, option: "" });
    this.searchCriteria.param_list.push({ name: "chk_posted", value: frm.chkPosted, option: "" });
    this.searchCriteria.param_list.push({ name: "chk_attorney", value: frm.chkAttorney, option: "" });
    this.searchCriteria.param_list.push({ name: "chk_deleted", value: frm.chkDeleted, option: "" });
    this.searchCriteria.param_list.push({ name: "payment_type", value: frm.ddPaymentType, option: "" });

    this.searchCriteria.param_list.push({ name: "date_from", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpFrom), option: "" });
    this.searchCriteria.param_list.push({ name: "date_to", value: this.dateTimeUtil.getStringDateFromDateModel(frm.dpTo), option: "" });

    this.getEOB();

  }

  getEOB() {
    debugger;
    this.listEOB = [];
    this.listEOBDb = [];
    this.listEOBAttachment = [];
    this.billingService.getEOB(this.searchCriteria).subscribe(
      data => {
        if (data != null) {
          this.listEOB = data;
          this.listEOBDb = data;
          if (this.listEOB.length > 0) {
            this.selectedSummaryRow = 0;
            this.onselectionChange(this.listEOB[0], this.selectedSummaryRow);
          }
        }
        this.isLoading = false;
      },
      error => {
        alert(error);
        this.isLoading = false;
      }
    );

  }

  selectedSummaryRow = 0;
  onselectionChange(e, i) {
    this.selectedSummaryRow = i;

    let attCriteria: SearchCriteria = new SearchCriteria()
    attCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    attCriteria.criteria = '';
    attCriteria.option = '';
    attCriteria.param_list = [];
    attCriteria.param_list.push({ name: "eob_id", value: e.eob_id, option: "" });
    this.billingService.getEOBAttachment(attCriteria).subscribe(
      data => {
        this.listEOBAttachment = data;
      },
      error => {

      }
    );
  }
  onDownload(document) {
    debugger;
    this.isLoading = true;
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.downloadPath + "/" + document.file_link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.isLoading = false;
          this.downloafile(data, document.file_link, document.original_file_name);
        },
        error => {
          alert(error);
          this.isLoading = false;
        }
      );

  }
  downloafile(data, doc_link, name) {

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
    var file_name = this.listEOB[this.selectedSummaryRow].eob_id + "_" + this.listEOB[this.selectedSummaryRow].check_number + "_" + this.generalOperation.ReplaceAll(this.listEOB[this.selectedSummaryRow].check_date, "/", "") + "." + file_ext;
    var fileURL;
    var file = new Blob([data], { type: file_type });
    //FileSaver.saveAs(file, name + "." + file_ext);
    FileSaver.saveAs(file, file_name);
  }
  downloadPath;
  openDocument(e) {
    let searchCriteria: SearchCriteria = new SearchCriteria;
    searchCriteria.criteria = this.downloadPath + "/" + e.file_link;
    this.generalService.downloadFile(searchCriteria)
      .subscribe(
        data => {
          debugger;
          this.downloafileResponse(data, e.file_link);
        },
        error => alert(error)
      );
  }
  doc_path = '';
  downloafileResponse(data, doc_link) {
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
      case 'doc':
        file_type = 'application/msword';
        break;
      case 'docx':
        file_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;

    }
    var file = new Blob([data], { type: file_type });//, {type: 'application/pdf'}
    var fileURL = URL.createObjectURL(file);

    let path = fileURL;
    this.doc_path = path;

    const modalRef = this.ngbModal.open(DocumentViewerComponent, this.xLgPopUpOptions);
    modalRef.componentInstance.path_doc = path;
    modalRef.componentInstance.width = '800px';
  }
  lgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  xLgPopUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'modal-adaptive'
  };

  /*
  showPayeSearch = false;
  payer_id_Upload = '';
  onPayeSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPayeSearch = true;
    }
    else {
      this.showPayeSearch = false;
    }
  }
  openSelectPaye(patObject) {
    debugger;
    this.payer_id_Upload = patObject.payerid;

    (this.inputForm.get('txtPaySearch') as FormControl).setValue(patObject.name + " (" + patObject.payer_number + ")");

    this.showPayeSearch = false;
  }
  closePayeSearch() {
    this.showPayeSearch = false;
    this.onPayerSearchBlur();
  }
  onPayeSearchBlur() {
    if (this.payer_id_Upload == undefined && this.showPayeSearch == false) {
      this.payer_id_Upload = "";
      this.inputForm.get("txtPayeSearch").setValue(null);
    }
  }
  showPatSearch = false;
  PatientID_Upload = ''
  onPatSearchKeydown(event) {
    if (event.key === "Enter") {
      this.showPatSearch = true;
    }
   
    else {
      this.showPatSearch = false;
    }
  }


  openSelectPat(patObject) {
    this.PatientID_Upload = patObject.patient_id;
    this.inputForm.get("txtPatSearch").setValue(patObject.name);
    this.showPatSearch = false;
  }
  closePatSearch() {
    this.showPatSearch = false;
    this.onPatSearchBlur();
  }
  onPatSearchBlur() {
    if (this.PatientID_Upload == undefined && this.showPatientSearch == false) {
      this.inputForm.get("txtPatSearch").setValue('');
    }
  }
  selectedDocName: string = "";
  fileAttached: any;
  onFileChange(event) {
    debugger;
    this.fileAttached = undefined;
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      this.fileAttached = event.target.files[0];
      this.selectedDocName = this.fileAttached.name;
    }
    else {
      this.selectedDocName = "";
    }
  }
  objORM: ORMEOBSave;
  objEOBAttachment: ORMEobAttachments;
  onUploadEOB(frm) {
    debugger;
    if ((this.inputForm.get('txtFillingDate') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please select Filing Date.", 'warning')
      return;
    }
    if ((this.inputForm.get('txtCheckDate') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please select Check Date.", 'warning')
      return;
    }
    if ((this.inputForm.get('txtCheckNo') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please enter Check Number.", 'warning')
      return;
    }
    if ((this.inputForm.get('txttotalAmount') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please enter Total Amount.", 'warning')
      return;
    }
    if ((this.inputForm.get('txttotalAmount') as FormControl).value == "") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please enter Total Amount.", 'warning')
      return;
    }
    if (this.PaymentTypeValue == "EOB" && (this.payer_id_Upload == '' || this.payer_id_Upload == null)) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please select Payer.", 'warning')
      return;
    }
    if (this.PaymentTypeValue == "Patient" && (this.PatientID_Upload == '' || this.PatientID_Upload == null)) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please select Patient.", 'warning')
      return;
    }
    if ((this.operation == "New" || this.docRemove == true) && (this.fileAttached == null || this.fileAttached == undefined)) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Please select the EOB document to upload.", 'warning')
      return;
    }
    if (!this.dateTimeUtil.isValidDateTime((this.inputForm.get('txtFillingDate') as FormControl).value, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Filling Date is not in correct format.", 'warning')
      return;
    }
    if (!this.dateTimeUtil.isValidDateTime((this.inputForm.get('txtCheckDate') as FormControl).value, DateTimeFormat.DATE_MODEL)) {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Validation", "Check Date is not in correct format.", 'warning')
      return;
    }
    debugger;
    this.objORM = new ORMEOBSave();
    this.objORM.eob_date = this.dateTimeUtil.getStringDateFromDateModel(frm.txtFillingDate);

    if (frm.txtpaymentType == 'Patient') {
      this.objORM.patient_id = this.PatientID_Upload;
    }
    else {
      this.objORM.payer_id = this.payer_id_Upload;
    }
    // if(attornyID_Upload!="")
    // {
    // 	objORM.attorney_id=attornyID_Upload;
    // }

    this.objORM.check_amount = frm.txttotalAmount;
    this.objORM.check_date = this.dateTimeUtil.getStringDateFromDateModel(frm.txtCheckDate);;
    this.objORM.check_number = frm.txtCheckNo;

    if (this.operation.toUpperCase() == "EDIT") {
      this.objORM.client_date_created = this.listEOB[this.selectedSummaryRow].client_date_created
      this.objORM.date_created = this.listEOB[this.selectedSummaryRow].date_created
      this.objORM.created_user = this.listEOB[this.selectedSummaryRow].created_user
      this.objORM.eob_id = this.listEOB[this.selectedSummaryRow].eob_id;
    }
    else {
      this.objORM.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      this.objORM.created_user = this.lookupList.logedInUser.user_name;
    }

    this.objORM.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();
    this.objORM.modified_user = this.lookupList.logedInUser.user_name;

    this.objORM.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objORM.is_posted = false;
    this.objORM.deleted = false;
    this.objORM.system_ip = this.lookupList.logedInUser.systemIp;
    this.objORM.payment_type = frm.txtpaymentType;

    if (frm.chkPayment == 'check') {
      this.objORM.payment_source = "Check";
    }
    else if (frm.chkPayment == 'credit') {
      this.objORM.payment_source = "Credit Card";
    }

    this.objEOBAttachment = new ORMEobAttachments;
    this.objEOBAttachment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
    this.objEOBAttachment.modified_user = this.lookupList.logedInUser.user_name;
    this.objEOBAttachment.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

    if (this.operation === "Edit") {
      if (this.fileAttached != null && this.fileAttached != undefined) {
        this.objEOBAttachment.original_file_name = this.fileAttached.name;
        this.objEOBAttachment.eob_id = this.listEOB[this.selectedSummaryRow].eob_id;
        this.objEOBAttachment.attachment_id = this.listEOBAttachment[0].attachment_id;
      }
      else {
        this.objEOBAttachment.original_file_name = this.listEOBAttachment[0].original_file_name;
        this.objEOBAttachment.file_link = this.listEOBAttachment[0].file_link;
        this.objEOBAttachment.created_user = this.listEOB[this.selectedSummaryRow].created_user;
        this.objEOBAttachment.client_date_created = this.listEOB[this.selectedSummaryRow].client_date_created;
        this.objEOBAttachment.date_created = this.listEOB[this.selectedSummaryRow].date_created;
        this.objEOBAttachment.eob_id = this.listEOB[this.selectedSummaryRow].eob_id;
        this.objEOBAttachment.attachment_id = this.listEOBAttachment[0].attachment_id;
      }
    }
    else {
      if (this.fileAttached != null && this.fileAttached != undefined) {
        this.objEOBAttachment.original_file_name = this.fileAttached.name;
        this.objEOBAttachment.created_user = this.lookupList.logedInUser.user_name;
        this.objEOBAttachment.date_created = this.dateTimeUtil.getCurrentDateTimeString();
        this.objEOBAttachment.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
      }
    }
    const formData: FormData = new FormData();

    formData.append('docFile', this.fileAttached);
    formData.append('EobData', JSON.stringify(this.objORM));
    formData.append('EobAttach', JSON.stringify(this.objEOBAttachment));

    this.billingService.uploadEOB(formData)
      .subscribe(
        data => this.savedSuccessfull(data),
        error => alert(error)
      );
  }
  PaymentTypeValue = 'EOB';
  cmbpaymentType(event) {
    debugger;
    this.PaymentTypeValue = event.currentTarget.value;
  }
  onDocRemove() {
    this.docRemove = true;
    this.inputForm.controls['txtFile'].setValidators([Validators.required]);
    this.selectedDocName = '';
  }
  savedSuccessfull(data) {
    debugger;
    if (data.status === "SUCCESS") {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Save", "EOB has been uploded Successfully.\nEOB ID:\t" + data['result'].toString(), 'success')
      this.payer_id_Upload = ''
      this.PatientID_Upload = ''
      this.fileAttached = undefined;

      document.getElementById('closeModal').click();
      document.getElementById('btnSearch').click();
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, "Save Error", data['result'].split('~')[1], 'danger')
      //console.log(data.error_message);
    }
  }
  */

  addEditEOB(operation: string, eobId: number) {


    debugger;
    const modalRef = this.ngbModal.open(AddEditEobComponent, this.popUpOptions);

    modalRef.componentInstance.eobId = eobId;
    modalRef.componentInstance.operation = operation;

    modalRef.result.then((result) => {
      if (result != undefined) {
        if (this.searchCriteria == null || this.searchCriteria != undefined) {
          this.searchCriteria = new SearchCriteria()
          this.searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
          this.searchCriteria.criteria = '';
          this.searchCriteria.option = '';
          this.searchCriteria.param_list = [];
          this.searchCriteria.param_list.push({ name: "eob_id", value: result.toString(), option: "" });
        }
        this.getEOB();
      }
    }
      , (reason) => {

        //alert(reason);
      });

  }

  /*
  openEObWind(opr,content) {
    debugger;
    this.docRemove = false;
    this.selectedDocName = '';
    if (opr == "new") {
      this.operation = "New";
      this.inputForm = this.formBuilder.group({
        chkPayment: this.formBuilder.control('check'),
        txtFillingDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
        txtCheckDate: this.formBuilder.control(''),
        txtCheckNo: this.formBuilder.control(''),
        txttotalAmount: this.formBuilder.control(''),
        txtpaymentType: this.formBuilder.control('EOB'),
        txtPaySearch: this.formBuilder.control(''),
        txtPatSearch: this.formBuilder.control(''),
        txtFile: this.formBuilder.control(null, Validators.required)
      })
    }
    else {
      this.operation = "Edit";
      this.isLoading=true;
      if(this.listEOB[this.selectedSummaryRow].created_user.toString().toUpperCase() != this.lookupList.logedInUser.user_name.toUpperCase() && this.is_Billing==false)
        {
          GeneralOperation.showAlertPopUp(this.ngbModal,"EOB","Selected EOB can't be modified.",'danger');
          this.isLoading=false;
          return;
        }
        else
        {
          this.billingService.checkEOBPostedRecords(this.listEOB[this.selectedSummaryRow].eob_id).subscribe(
            data=>{
              if(data)
              {
                GeneralOperation.showAlertPopUp(this.ngbModal,"EOB","Selected EOB can't be modified.",'danger');
                this.isLoading=false;
                return;
              }
              else{
                this.open(content);
              }
              this.isLoading=false;
            },error=>{

            }

          );
        }
        
      this.inputForm = this.formBuilder.group({
        chkPayment: this.formBuilder.control(this.listEOB[this.selectedSummaryRow].payment_source == 'Check' ? 'check' : this.listEOB[this.selectedSummaryRow].payment_source == 'Credit Card' ? 'credit' : 'check'),
        txtFillingDate: this.formBuilder.control(this.dateTimeUtil.getDateModelFromDateString(this.listEOB[this.selectedSummaryRow].eob_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
        txtCheckDate: this.formBuilder.control(this.dateTimeUtil.getDateModelFromDateString(this.listEOB[this.selectedSummaryRow].check_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY)),
        txtCheckNo: this.formBuilder.control(this.listEOB[this.selectedSummaryRow].check_number),
        txttotalAmount: this.formBuilder.control(this.listEOB[this.selectedSummaryRow].check_amount),
        txtpaymentType: this.formBuilder.control(this.listEOB[this.selectedSummaryRow].payment_type),
        txtPaySearch: this.formBuilder.control(this.listEOB[this.selectedSummaryRow].payer_name + ' (' + this.listEOB[this.selectedSummaryRow].payer_number + ' )'),
        txtPatSearch: this.formBuilder.control(this.listEOB[this.selectedSummaryRow].patient_name),
        txtFile: this.formBuilder.control(null, null),
      })

      this.payer_id_Upload = this.listEOB[this.selectedSummaryRow].payer_id;
      this.PatientID_Upload = this.listEOB[this.selectedSummaryRow].patient_id;

      if (this.listEOBAttachment.length > 0) {
        this.selectedDocName = this.listEOBAttachment[0].original_file_name;
      }
    }
  }
  */
  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };
  onDeleteEOB(e) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to delete selected record ?' + name;
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.isProcessing = true;
        let deleteRecordData = new ORMDeleteRecord();
        deleteRecordData.column_id = e.eob_id;
        deleteRecordData.modified_user = this.lookupList.logedInUser.user_name;
        deleteRecordData.client_date_time = this.dateTimeUtil.getCurrentDateTimeString();
        deleteRecordData.client_ip = this.lookupList.logedInUser.systemIp;

        this.billingService.deleteEOB(deleteRecordData)
          .subscribe(
            data => {
              debugger;
              this.isProcessing = false;
              if (data == -1) {
                GeneralOperation.showAlertPopUp(this.ngbModal, 'EOB', "Selected EOB can't be deleted.\nIt is referenced in payment\n.", AlertTypeEnum.INFO);
              }
              else if (data > 0) {
                this.getEOB();
              }
              else {
                GeneralOperation.showAlertPopUp(this.ngbModal, 'Error In Delete EOB', 'An error occured while deleting record.', AlertTypeEnum.DANGER)
              }
            },
            error => {
              this.isProcessing = false;
              GeneralOperation.showAlertPopUp(this.ngbModal, 'Error In Delete EOB', error, AlertTypeEnum.DANGER)
            }
          );
      }
    }, (reason) => {
      //alert(reason);
    });

  }

  onMarkPOsted(e) {
    const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
    modalRef.componentInstance.promptHeading = 'Confirm Mark As Posted!';
    modalRef.componentInstance.promptMessage = 'Are you sure you want to Mark selected EOB as Posted ?' + name;
    modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
    let closeResult;

    modalRef.result.then((result) => {
      debugger;
      if (result == PromptResponseEnum.YES) {
        this.isProcessing = true;
        let searchCriteria: SearchCriteria = new SearchCriteria();

        searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        searchCriteria.param_list = [
          { name: "data_option", value: "EOB", option: "" },
          { name: "id", value: e.eob_id, option: "" },
          { name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: '' },
          { name: "client_date_time", value: this.dateTimeUtil.getCurrentDateTimeString(), option: '' },
          { name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: '' }
        ];


        this.billingService.markAsPosted(searchCriteria)
          .subscribe(
            data => this.onMarkAsPostedSuccessfully(data),
            error => {
              this.isProcessing = false;
              GeneralOperation.showAlertPopUp(this.ngbModal, 'Error In Mark As Posted EOB', error, AlertTypeEnum.DANGER)
            }
          );
      }
    }, (reason) => {
      //alert(reason);
    });
  }
  onMarkAsPostedSuccessfully(data) {

    debugger;
    this.isProcessing = false;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.getEOB();
    }
    else {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'EOB Mark As Posted', data.response, AlertTypeEnum.DANGER)
    }

  }
  popUpOptionsLg: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  postingDetails(e) {
    const modalRef = this.ngbModal.open(ClaimPostedPaymentDetailsComponent, this.popUpOptionsLg);
    modalRef.componentInstance.eobEraId = e.eob_id;
    modalRef.componentInstance.eobEraIdType = "EOB";
  }
  postPatientPayment(e) {
    const modalRef = this.ngbModal.open(EOBPatientPaymentComponent, this.popUpOptionsLg);
    modalRef.componentInstance.patient_id = e.patient_id;
    modalRef.componentInstance.check_amount = e.check_amount;
    modalRef.componentInstance.check_no = e.check_number;
    modalRef.componentInstance.check_date = e.check_date;
    modalRef.componentInstance.patient_name = e.patient_name;
    modalRef.componentInstance.eob_id = e.eob_id;
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  sortEvent: SortEvent;
  onSort(sortEvent: SortEvent) {
    this.sortEvent = sortEvent;
    this.search();
  }
  private search() {
    let sortFilterPaginationResult: SortFilterPaginationResult = this.sortFilterPaginationService.search(this.listEOBDb, this.headers, this.sortEvent, null, null, '');
    debugger;
    this.listEOB = sortFilterPaginationResult.list;
  }
  openPatient(data) {
    debugger;
    let obj: PatientToOpen = new PatientToOpen();
    obj.patient_id = data.patient_id;
    obj.patient_name = data.patient_name;
    this.openModuleService.openPatient.emit(obj);
  }

  onClearSearch() {

    this.dateRangeType = 'filing_date';

    this.searchFormGroup.get('dateRangeType').setValue(this.dateRangeType);
    this.searchFormGroup.get('dpFrom').setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchFormGroup.get('dpTo').setValue(this.dateTimeUtil.getCurrentDateModel());
    this.searchFormGroup.get('txtPayerSearch').setValue('');
    this.searchFormGroup.get('txtPatientSearch').setValue('');
    this.searchFormGroup.get('txtEOBId').setValue('');
    this.searchFormGroup.get('txtCheckNo').setValue('');
    this.searchFormGroup.get('ddPaymentType').setValue('EOB');
    this.searchFormGroup.get('chkPending').setValue(false);
    this.searchFormGroup.get('chkPosted').setValue(false);
    this.searchFormGroup.get('chkAttorney').setValue(false);
    this.searchFormGroup.get('chkDeleted').setValue(false);

    this.patientIdSearched = undefined;
    this.payerIdSearched = undefined;
    this.patientNameSearched = '';
    this.payerNameSearched = '';

  }


  onDateFocusOut(date: string, controlName: string) {
    debugger;
    let formatedDate = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined && formatedDate != '') {
      this.searchFormGroup.get(controlName).setValue(formatedDate);
    }
  }
}
