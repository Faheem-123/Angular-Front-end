import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { GeneralService } from 'src/app/services/general/general.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { ORMEOBSave } from 'src/app/models/billing/ORMEOBSave';
import { ORMEobAttachments } from 'src/app/models/billing/ORMEobAttachments';
import { DecimalPipe } from '@angular/common';
import { InlinePatientSearchComponent } from 'src/app/general-modules/inline-patient-search/inline-patient-search.component';
import { InlinePayerSearchComponent } from 'src/app/general-modules/inline-payer-search/inline-payer-search.component';
import { BillingService } from 'src/app/services/billing/billing.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AlertTypeEnum } from 'src/app/shared/enum-util';

@Component({
  selector: 'add-edit-eob',
  templateUrl: './add-edit-eob.component.html',
  styleUrls: ['./add-edit-eob.component.css']
})
export class AddEditEobComponent implements OnInit {


  @Input() eobId: number;
  @Input() operation: string = 'new';


  @ViewChild('inlinePatSearch') inlinePatSearch: InlinePatientSearchComponent;
  @ViewChild('inlinePayerSearch') inlinePayerSearch: InlinePayerSearchComponent;


  isLoading: boolean = false;
  isSaving:boolean=false;
  title: string = 'Add/Edit EOB';

  formGroup: FormGroup;
  paymentType: string = 'EOB';
  errorMsg: string = '';
  docRemove = false;

  showPayerSearch = false;
  payerId: number;
  showPatSearch = false;
  patientId: number;

  payerName: string = '';
  patientName: string = '';

  loadingCount: number = 0;


  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private ngbModal: NgbModal,
    private generalService: GeneralService,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe,
    private billingService: BillingService) { }

  ngOnInit() {

    this.buildForm();

    if (this.operation == 'new') {
      this.title = 'Add EOB';
    }
    else if (this.operation == 'edit') {
      this.title = 'Edit EOB';

      this.loadingCount = 2;
      this.getEOB();
      this.getAttachments();
    }
  }

  buildForm() {

    this.formGroup = this.formBuilder.group({
      dpFilingDate: this.formBuilder.control(this.dateTimeUtil.getCurrentDateModel()),
      chkPaymentType: this.formBuilder.control('EOB'),
      ddPaymentMode: this.formBuilder.control('Check'),

      dpCheckDate: this.formBuilder.control(''),
      txtCheckNo: this.formBuilder.control(''),
      txtTotalAmount: this.formBuilder.control(''),

      txtPayerSearch: this.formBuilder.control(''),
      txtPatSearch: this.formBuilder.control(''),
      txtFile: this.formBuilder.control(null, Validators.required)
    })
  }

  eobDetail: any;
  listEOBAttachment: Array<any>;

  getEOB() {
    this.isLoading = true;
    this.eobDetail = undefined;
    this.billingService.getEobById(this.eobId).subscribe(
      data => {

        this.eobDetail = data;

        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.assignValues();
          this.isLoading = false;
        }
      },
      error => {
        alert(error);
        this.isLoading = false;
      }
    );

  }

  getAttachments() {
    this.listEOBAttachment = undefined;
    let searchCriteria: SearchCriteria = new SearchCriteria()
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.criteria = '';
    searchCriteria.option = '';
    searchCriteria.param_list = [];
    searchCriteria.param_list.push({ name: "eob_id", value: this.eobId, option: "" });
    this.billingService.getEOBAttachment(searchCriteria).subscribe(
      data => {
        this.listEOBAttachment = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.assignValues();
          this.isLoading = false;
        }
      },
      error => {
        alert(error);
        this.isLoading = false;
      }
    );
  }

  assignValues() {


    if (this.eobDetail != undefined) {

      this.formGroup.get('dpFilingDate').setValue(this.dateTimeUtil.getDateModelFromDateString(this.eobDetail.eob_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
      this.formGroup.get('chkPaymentType').setValue(this.eobDetail.payment_type);
      this.formGroup.get('ddPaymentMode').setValue(this.eobDetail.payment_source);
      this.formGroup.get('dpCheckDate').setValue(this.dateTimeUtil.getDateModelFromDateString(this.eobDetail.check_date, DateTimeFormat.DATEFORMAT_MM_DD_YYYY));
      this.formGroup.get('txtCheckNo').setValue(this.eobDetail.check_number);
      this.formGroup.get('txtTotalAmount').setValue(this.eobDetail.check_amount);
      this.formGroup.get('txtPayerSearch').setValue(this.eobDetail.payer_name + ' (' + this.eobDetail.payer_number + ')');
      this.formGroup.get('txtPatSearch').setValue(this.eobDetail.patient_name);




      this.patientName = this.eobDetail.patient_name
      this.payerName = this.eobDetail.payer_name + ' (' + this.eobDetail.payer_number + ')';

      this.patientId = this.eobDetail.patient_id;
      this.payerId = this.eobDetail.payer_id;
      this.paymentType = this.eobDetail.payment_type;

      this.selectedDocName = this.listEOBAttachment[0].original_file_name;
    }

  }
  /*
  ddPaymentTypeChanged(event) {
 
    this.paymentType = event.currentTarget.value;
  }
  */

  onPaymentTypeChanged(type: string) {
    this.paymentType = type;
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
    this.payerId = patObject.payerid;

    this.payerName = patObject.name + " (" + patObject.payer_number + ")";
    (this.formGroup.get('txtPayerSearch') as FormControl).setValue(this.payerName);

    this.showPayerSearch = false;
  }
  closePayerSearch() {
    this.showPayerSearch = false;
    this.onPayerSearchBlur();
  }
  onPayerSearchBlur() {
    if (this.payerId == undefined && this.showPayerSearch == false) {
      this.payerId = undefined;
      this.payerName = '';
      this.formGroup.get("txtPayerSearch").setValue('');
    }
  }
  onPayerSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.payerName) {
      this.payerId = undefined;
    }

  }


  onPatSearchKeydown(event) {


    if (event.key === "Enter") {
      this.showPatSearch = true;
    }
    else if (event.key == 'ArrowDown') {
      debugger;
      this.shiftFocusToPatSearch();
    }
    else {
      this.showPatSearch = false;
    }
  }
  shiftFocusToPatSearch() {
    this.inlinePatSearch.focusFirstIndex();
  }
  openSelectPat(patObject) {
    this.patientId = patObject.patient_id;
    this.patientName = patObject.name;
    this.formGroup.get("txtPatSearch").setValue(this.patientName);
    this.showPatSearch = false;
  }
  closePatSearch() {
    this.showPatSearch = false;
    this.onPatSearchBlur();
  }
  onPatSearchBlur() {
    if (this.patientId == undefined && this.showPatSearch == false) {
      this.patientName = '';
      this.formGroup.get("txtPatSearch").setValue('');
    }
  }

  onPatientSearchInputChange(newValue) {
    this.logMessage.log("onPatientSearchChange");
    if (newValue !== this.patientName) {
      this.patientId = undefined;
    }

  }

  onDocRemove() {
    this.docRemove = true;
    this.formGroup.controls['txtFile'].setValidators([Validators.required]);
    this.selectedDocName = '';
  }

  validateData(formVal: any) {
    this.errorMsg = '';


    if (formVal.dpFilingDate == undefined || formVal.dpFilingDate == null || formVal.dpFilingDate == '') {
      this.errorMsg = 'Please enter Filing Date.';
    }
    else if (!this.dateTimeUtil.isValidDateTime(formVal.dpFilingDate, DateTimeFormat.DATE_MODEL)) {
      this.errorMsg = 'Filing Date is invalid.';
    }


    if (this.errorMsg == '' && formVal.chkPaymentType == '') {
      this.errorMsg = 'Please select Payment Type.'
    }

    if (this.errorMsg == '' && formVal.chkPaymentType == 'EOB' && this.payerId == undefined) {
      this.errorMsg = 'Please select Payer.'
    }

    if (this.errorMsg == '' && formVal.chkPaymentType == 'Patient' && this.patientId == undefined) {
      this.errorMsg = 'Please select Patient.'
    }

    if (this.errorMsg == '' && formVal.ddPaymentMode == '') {
      this.errorMsg = 'Please select Payment Source.'
    }

    if (this.errorMsg == '' && formVal.txtTotalAmount == '') {
      this.errorMsg = 'Please enter total amount.'
    }

    if (this.errorMsg == '' && formVal.txtCheckNo == '') {
      this.errorMsg = 'Please enter Check Number.'
    }

    if (this.errorMsg == '') {

      if (formVal.dpCheckDate == undefined || formVal.dpCheckDate == null || formVal.dpCheckDate == '') {
        this.errorMsg = 'Please enter Check Date.';
      }
      else if (!this.dateTimeUtil.isValidDateTime(formVal.dpCheckDate, DateTimeFormat.DATE_MODEL)) {
        this.errorMsg = 'Check Date is invalid.';
      }
    }
    if (this.errorMsg == '') {
      if ((this.operation == "new" || this.docRemove == true) && (this.fileAttached == null || this.fileAttached == undefined)) {
        this.errorMsg = 'Please select the EOB document to upload.';

      }
    }

    if (this.errorMsg == '') {
      return true;
    }
    else {
      return false;
    }
  }

  onSubmit(formVal: any) {

    if (this.validateData(formVal)) {

      this.isSaving=true;
      let objORM = new ORMEOBSave();
      let clientDateTime: string = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      objORM.eob_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpFilingDate);
      objORM.payment_type = formVal.chkPaymentType;
      if (formVal.chkPaymentType == 'Patient') {
        objORM.patient_id = this.patientId.toString();
      }
      else {
        objORM.payer_id = this.payerId.toString();
      }

      if (this.operation == "edit") {
        objORM.client_date_created = this.eobDetail.client_date_created
        objORM.date_created = this.eobDetail.date_created
        objORM.created_user = this.eobDetail.created_user
        objORM.eob_id = this.eobId.toString();
      }
      else {
        objORM.client_date_created = clientDateTime;
        objORM.created_user = this.lookupList.logedInUser.user_name;
      }

      objORM.payment_source = formVal.ddPaymentMode;
      objORM.check_amount = formVal.txtTotalAmount;
      objORM.check_date = this.dateTimeUtil.getStringDateFromDateModel(formVal.dpCheckDate);;
      objORM.check_number = formVal.txtCheckNo;

      objORM.client_date_modified = clientDateTime;
      objORM.modified_user = this.lookupList.logedInUser.user_name;

      objORM.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      objORM.is_posted = false;
      objORM.deleted = false;
      objORM.system_ip = this.lookupList.logedInUser.systemIp;


      /*
      if (formVal.chkPayment == 'check') {
        objORM.payment_source = "Check";
      }
      else if (formVal.chkPayment == 'credit') {
        objORM.payment_source = "Credit Card";
      }
      */

     debugger;


      let objEOBAttachment = new ORMEobAttachments;
      objEOBAttachment.practice_id = this.lookupList.practiceInfo.practiceId.toString();
      objEOBAttachment.modified_user = this.lookupList.logedInUser.user_name;
      objEOBAttachment.client_date_modified = clientDateTime;
      objEOBAttachment.system_ip=this.lookupList.logedInUser.systemIp;


      if (this.operation === "edit") {
        
        if (this.fileAttached != null && this.fileAttached != undefined) {
          objEOBAttachment.original_file_name = this.fileAttached.name;
        }
        else {
          objEOBAttachment.original_file_name = this.listEOBAttachment[0].original_file_name;
          objEOBAttachment.file_link = this.listEOBAttachment[0].file_link;         
        }

        objEOBAttachment.created_user = this.listEOBAttachment[0].created_user;
        objEOBAttachment.client_date_created = this.listEOBAttachment[0].client_date_created;
        objEOBAttachment.date_created = this.listEOBAttachment[0].date_created;
        objEOBAttachment.eob_id = this.eobId.toString();
        objEOBAttachment.attachment_id = this.listEOBAttachment[0].attachment_id;
      }
      else {
        if (this.fileAttached != null && this.fileAttached != undefined) {
          objEOBAttachment.original_file_name = this.fileAttached.name;        
        }

        objEOBAttachment.created_user = this.lookupList.logedInUser.user_name;
        objEOBAttachment.date_created = clientDateTime;
        objEOBAttachment.client_date_created = clientDateTime;
      }
      const formData: FormData = new FormData();

      formData.append('docFile', this.fileAttached);
      formData.append('EobData', JSON.stringify(objORM));
      formData.append('EobAttach', JSON.stringify(objEOBAttachment));

      this.billingService.uploadEOB(formData)
        .subscribe(
          data => this.savedSuccessfull(data),
          error => {
            this.isSaving=false;
            GeneralOperation.showAlertPopUp(this.ngbModal, "EOB", error, AlertTypeEnum.DANGER)
          }
        );
    }
  }

  savedSuccessfull(data) {
    debugger;
    this.isSaving=false;
    if (data.status === "SUCCESS") {

      GeneralOperation.showAlertPopUp(this.ngbModal, "EOB", "EOB has been uploded Successfully.\nEOB ID:\t" + data['result'].toString(), AlertTypeEnum.SUCCESS)
      // this.payer_id_Upload = ''
      // this.PatientID_Upload = ''
      //this.fileAttached = undefined;

      //document.getElementById('closeModal').click();
      //document.getElementById('btnSearch').click();

      this.activeModal.close(data['result'].toString());
    }
    else {
      debugger;
      GeneralOperation.showAlertPopUp(this.ngbModal, "EOB", data['response'].split('~')[1], AlertTypeEnum.DANGER)
      //console.log(data.error_message);
    }
  }

  onDateFocusOut(date: string, controlName: string) {
    debugger;
    let formatedDate = this.dateTimeUtil.getDateFromDigitsOnly(date, DateTimeFormat.DATE_MODEL);
    if (formatedDate != undefined && formatedDate != '') {
      this.formGroup.get(controlName).setValue(formatedDate);
    }
  }

  formateCurrencyInputs(controlName: string) {
    debugger;
    let value: any = (this.formGroup.get(controlName) as FormControl).value;
    if (!isNaN(value)) {
      let formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      (this.formGroup.get(controlName) as FormControl).setValue(formatedValue);
    }
  }
}