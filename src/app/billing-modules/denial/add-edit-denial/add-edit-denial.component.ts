import { Component, OnInit, Input, Inject } from '@angular/core';
import { CallingFromEnum, EobEraTypeEnum, AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { ORMDenialMessagesSave } from 'src/app/models/billing/orm-denial-messages-save';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { BillingService } from 'src/app/services/billing/billing.service';

declare var $: any;

@Component({
  selector: 'add-edit-denial',
  templateUrl: './add-edit-denial.component.html',
  styleUrls: ['./add-edit-denial.component.css']
})
export class AddEditDenialComponent implements OnInit {

  @Input() objDenial: any;
  @Input() claimId: number;
  @Input() patientId: number;
  @Input() denialIds: string;
  @Input() operationType: string = '';


  denialFormGroup: FormGroup;
  isLoading: boolean = false;

  title: string = "Add/Edit Denial";

  lstInsurances: Array<any>;

  eobEraIdType: EobEraTypeEnum = EobEraTypeEnum.ERA;

  eobEraId: string = '';
  insuranceId: number;
  denialMsg: string = '';
  resolvelMsg: string = '';
  insName: string = '';
  policyNumber: string = '';
  insType: string = '';
  status: string = '';

  //isReadOnly: boolean = false;

  constructor(private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private billingService: BillingService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private paymentService: PaymentService,
    private ngbModal: NgbModal) { }

  ngOnInit() {  
    
    try {
      $(document).ready(function(){
        let modalContent: any = $('.modal-content');
        let modalHeader = $('.modal-header');
        modalHeader.addClass('cursor-all-scroll');
        modalContent.draggable({
            handle: '.modal-header'
        });
      });
    } catch (error) {
      
    }
    
    debugger;
    if (this.operationType == 'new') {        
      //this.isReadOnly = false;
      this.title = "Add Denial";
      this.status = "ACTIVE";
      this.getPaymentInsurances();
    }
    else if (this.operationType == 'single') {

      this.title = "Resolve Denial";

      if (this.objDenial != undefined) {

        this.eobEraIdType = this.objDenial.eob_era_id_type;
        this.eobEraId = this.objDenial.eob_era_id;
        this.insuranceId = this.objDenial.insurance_id;
        this.denialMsg = this.objDenial.message;
        this.resolvelMsg = this.objDenial.resolved_message;

        this.insName = this.objDenial.insurance_name;
        this.policyNumber = this.objDenial.policy_no;

        this.status = this.objDenial.status;

        //if (this.status != 'ACTIVE') {
        //  this.isReadOnly = true;
        //}

        this.getEobEraCheckDetailsById();
      }
    }
    else if (this.operationType == 'multiple') {
      //this.isReadOnly = false;
      //this.status = "ACTIVE";
      this.title = "Resolve Denial(s)";
    }

    if (this.status == "RESOLVED") {
      this.title = "View Denial";
    }

    this.buildForm();
  }

  buildForm() {
    this.denialFormGroup = this.formBuilder.group({
      ddEobEraType: this.formBuilder.control({
        value: this.eobEraIdType,
        //disabled: this.isReadOnly
        disabled: this.operationType != 'new'

      }
      ),
      txtEobEraId: this.formBuilder.control(
        {
          value: this.eobEraId,
          //disabled: this.isReadOnly
          disabled: this.operationType != 'new'
        }),
      ddInsurance: this.formBuilder.control(
        {
          value: this.insuranceId,
          //disabled: this.isReadOnly
          disabled: this.operationType != 'new'
        }),
      txtDenialMessage: this.formBuilder.control(
        {
          value: this.denialMsg,
          //disabled: this.isReadOnly
          disabled: this.operationType != 'new'
        }),
      txtResolvedMessage: this.formBuilder.control(
        {
          value: this.resolvelMsg,
          //disabled: this.isReadOnly
          disabled: (this.status != 'ACTIVE' && this.operationType != 'multiple')
        })
    });
  }

  getPaymentInsurances() {
    this.paymentService.getPaymentInsurances(this.claimId).subscribe(
      data => {
        this.lstInsurances = data as Array<any>;
      },
      error => {
        this.getPaymentInsurancesError(error);
      }
    );
  }
  getPaymentInsurancesError(error) {
    this.logMessage.log("getPaymentInsurances Error." + error);
  }





  validateData(formData: any): boolean {

    let isValid: boolean = true;
    let msg: string = "";

    if (this.operationType == 'new') {

      if (formData.ddEobEraType == undefined || formData.ddEobEraType == '') {
        msg = "Please select EOB/ERA Id Type."
      }
      else if (formData.txtEobEraId == undefined || formData.txtEobEraId == '' || !this.isValidEobEraId) {
        msg = "Please enter a valid " + formData.ddEobEraType + " Id.";
      }
      else if (formData.ddInsurance == undefined || formData.ddInsurance == '') {
        msg = "Please select insurance.";
      }

      else if (formData.txtDenialMessage == undefined || formData.txtDenialMessage == '') {
        msg = "Please enter a denial message.";
      }
    }
    else if (this.operationType == 'single') {
      if (formData.txtResolvedMessage == undefined || formData.txtResolvedMessage == '') {
        msg = "Please enter a denial resolved message.";
      }
    }
    else if (this.operationType == 'multiple') {

      if (this.denialIds == undefined || this.denialIds == "") {
        msg = "No Denial Message is selected."
      }
      else if (formData.txtResolvedMessage == undefined || formData.txtResolvedMessage == '') {
        msg = "Please enter a denial resolved message.";
      }
    }

    if (msg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Denial Messages', msg, AlertTypeEnum.DANGER)
      isValid = false;
    }
    return isValid;
  }

  onSave(formData: any) {

    if (this.validateData(formData)) {

      debugger;
      if (this.operationType == 'new') {

        let ormDenialMessagesSave: ORMDenialMessagesSave = new ORMDenialMessagesSave();

        ormDenialMessagesSave.claim_id = this.claimId
        ormDenialMessagesSave.patient_id = this.patientId;
        ormDenialMessagesSave.eob_era_id = formData.txtEobEraId;
        ormDenialMessagesSave.eob_era_id_type = formData.ddEobEraType;

        ormDenialMessagesSave.message = formData.txtDenialMessage;
        ormDenialMessagesSave.is_era_auto_denial = false;
        ormDenialMessagesSave.status = "ACTIVE";
        ormDenialMessagesSave.practice_id = this.lookupList.practiceInfo.practiceId;
        ormDenialMessagesSave.created_user = this.lookupList.logedInUser.user_name;
        ormDenialMessagesSave.client_date_created = this.dateTimeUtil.getCurrentDateTimeString();
        ormDenialMessagesSave.modified_user = this.lookupList.logedInUser.user_name;
        ormDenialMessagesSave.client_date_modified = this.dateTimeUtil.getCurrentDateTimeString();

        ormDenialMessagesSave.system_ip = this.lookupList.logedInUser.systemIp;

        ormDenialMessagesSave.insurance_id = this.insuranceId;// cbmInsurances.selectedItem.insurance_id;
        ormDenialMessagesSave.policy_number = this.policyNumber;// cbmInsurances.selectedItem.policy_number;

        this.billingService.saveDenialMessage(ormDenialMessagesSave).subscribe(
          data => {
            this.saveDenialMessageSuccess(data);
          },
          error => {
            this.saveDenialMessageError(error);
          }
        );

      }
      else if (this.operationType == 'single' || this.operationType == 'multiple') {

        let strCriteria: SearchCriteria = new SearchCriteria();
        strCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
        strCriteria.param_list = [];
        strCriteria.param_list.push({ name: "denial_ids", value: this.denialIds, option: "" });
        strCriteria.param_list.push({ name: "client_datetime", value: this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS), option: "" });
        strCriteria.param_list.push({ name: "loged_in_user", value: this.lookupList.logedInUser.user_name, option: "" });
        strCriteria.param_list.push({ name: "client_ip", value: this.lookupList.logedInUser.systemIp, option: "" });
        strCriteria.param_list.push({ name: "resolve_message", value: formData.txtResolvedMessage, option: "" });

        this.billingService.resolveDenialMessage(strCriteria).subscribe(
          data => {
            this.saveDenialMessageSuccess(data);
          },
          error => {
            this.saveDenialMessageError(error);
          }
        );

      }

    }
  }
  saveDenialMessageSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Denial Messages', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveDenialMessageError(error: any) {
    this.logMessage.log("saveDenialMessage Error.");
  }

  oncInsuranceChange(args) {
    this.insuranceId = args.target.value;

    this.lstInsurances.forEach(element => {

      if (element.insurance_id == this.insuranceId) {

        this.policyNumber = element.policy_number;
      }
    });
  }


  isValidEobEraId: boolean = false;
  isEobEraLoading: boolean = false;
  checkNo: string = '';
  checkDate: string = '';
  eobEraSourceName: string = '';

  ddEobEraTypeChanged(type: EobEraTypeEnum) {
    this.eobEraIdType = type;
    //this.formGroup.get('txtEobEraPageNo').disable();
    //this.eobEraType = this.formGroup.get("ddEobEraType").value;
    this.getEobEraCheckDetailsById();
  }

  //ddEobEraTypeChanged(type: EobEraTypeEnum) {
  //this.eobEraIdType = type;
  //}

  onEobEraIdFocusOut() {
    if (this.denialFormGroup.get("txtEobEraId").value != this.eobEraId) {
      this.eobEraId = this.denialFormGroup.get("txtEobEraId").value;
      this.getEobEraCheckDetailsById();
    }
  }

  getEobEraCheckDetailsById() {

    this.isValidEobEraId = false;

    if (this.eobEraId != undefined && this.eobEraId != ""
      && this.eobEraIdType != undefined) {


      this.isEobEraLoading = true;
      let searchCriteria: SearchCriteria = new SearchCriteria();
      searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;

      searchCriteria.param_list = [
        { name: "id_type", value: this.eobEraIdType, option: "" },
        { name: "id", value: this.eobEraId, option: "" }
      ];

      this.paymentService.getEobEraCheckDetailsById(searchCriteria).subscribe(
        data => {
          debugger;
          this.isEobEraLoading = false;
          this.assignCheckDetails(data);

        },
        error => {
          this.isEobEraLoading = false;
          this.getEobEraCheckDetailsByIdError(error);
        }
      );
    }
    else {
      this.isEobEraLoading = false;
      this.checkNo = undefined;
      this.checkDate = undefined;
    }
  }

  getEobEraCheckDetailsByIdError(error) {
    this.logMessage.log("getEobEraCheckDetailsById Error." + error);
  }

  assignCheckDetails(data: any) {

    if (data != undefined) {
      this.isValidEobEraId = true;
      this.checkNo = data.check_number;
      this.checkDate = data.check_date;
      this.eobEraSourceName = data.payer_name;

    }
    else {
      this.checkNo = undefined;
      this.checkDate = undefined;
      this.eobEraSourceName = undefined;
      this.isValidEobEraId = false;
    }
  }

  onPaste(event: ClipboardEvent, controlName: string) {
    debugger;
    event.preventDefault();

    var pastedText = '';

    if (event.clipboardData && event.clipboardData.getData) {// Standards Compliant FIRST!
      pastedText = event.clipboardData.getData('text/plain');
    }
    //else if (window.clipboardData && window.clipboardData.getData)
    //{// IE
    //    pastedText = window.clipboardData.getData('Text');
    //}

    this.denialFormGroup.get(controlName).setValue(pastedText.trim());

  }
}
