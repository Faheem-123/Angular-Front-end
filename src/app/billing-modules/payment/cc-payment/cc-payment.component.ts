import { DecimalPipe } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CCPaymentModel } from 'src/app/models/billing/cc-payment-model';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { PatientService } from 'src/app/services/patient/patient.service';
import { DateTimeFormat, DateTimeUtil } from 'src/app/shared/date-time-util';
import { EncryptDecryptService } from 'src/app/shared/encrypt-decrypt';
import { AlertTypeEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { LogMessage } from 'src/app/shared/log-message';



@Component({
  selector: 'cc-payment',
  templateUrl: './cc-payment.component.html',
  styleUrls: ['./cc-payment.component.css']
})
export class CcPaymentComponent implements OnInit {

  @Input() paymentAmount: number = 0;
  @Input() patientId: number = 0;


  formGroup: FormGroup;

  serviceName: string = '';
  preLoadingCount: number = 0;
  isLoading: boolean = false;

  isCCInfoView: boolean = false;

  constructor(public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private formBuilder: FormBuilder,
    private logMessage: LogMessage,
    private paymentService: PaymentService,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe,
    private ngbModal: NgbModal,
    private encryptDecryptService: EncryptDecryptService,
    private patientService: PatientService) { }

  ngOnInit() {


    this.buildForm();
    this.preLoadingCount = 1;
    this.isLoading = true;
    this.getPatientHeaderInfo();
  }



  buildForm() {
    this.formGroup = this.formBuilder.group({
      // txtCardNo: this.formBuilder.control(''),
      // txtExpirationMM: this.formBuilder.control(''),
      // txtExpirationYY: this.formBuilder.control(''),
      // txtCVC: this.formBuilder.control(''),
      txtCardHolderName: this.formBuilder.control(''),
      txtStreetAddress1: this.formBuilder.control(''),
      txtStreetAddress2: this.formBuilder.control(''),
      txtCity: this.formBuilder.control(''),
      txtState: this.formBuilder.control(''),
      txtZipCode: this.formBuilder.control('')
    }
    );
  }

  getPatientHeaderInfo() {
    this.patientService.getPatientHeader(this.patientId).subscribe(
      data => {
        this.preLoadingCount--;
        if (this.preLoadingCount == 0)
          this.isLoading = false;

        this.onHeaderSuccessfull(data);
      },
      error => {
        this.onHeaderError(error);
      }
    );
  }

  onHeaderSuccessfull(data) {

    this.formGroup.get('txtCardHolderName').setValue(data["first_name"] + ' ' + data["last_name"]);
    this.formGroup.get('txtStreetAddress1').setValue(data["address"]);
    this.formGroup.get('txtCity').setValue(data["city"]);
    this.formGroup.get('txtState').setValue(data["state"]);
    this.formGroup.get('txtZipCode').setValue(data["zip"]);
  }
  onHeaderError(error) {
    this.logMessage.log("onHeaderError Error.");
  }


  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  zip: string;


  onSubmit(formVal: any) {

    this.streetAddress1 = undefined;
    this.streetAddress2 = undefined;
    this.city = undefined;
    this.state = undefined
    this.zip = undefined;



    debugger;
    //let CurrentYY: number = Number(this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YY))

    if (this.paymentAmount == undefined || this.paymentAmount <= 0) {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'CC Payment', 'Payment is not valid.', AlertTypeEnum.DANGER);
      return;
    }
    // else if (formVal.txtCardNo == undefined || formVal.txtCardNo.trim() == '') {
    //   GeneralOperation.showAlertPopUp(this.ngbModal, 'CC Payment', 'Please enter Credit Card Number', AlertTypeEnum.DANGER);
    //   return;
    // }
    // else if (formVal.txtExpirationMM == undefined || formVal.txtExpirationMM.trim() == ''
    //   || Number(formVal.txtExpirationMM) == NaN
    //   || Number(formVal.txtExpirationMM) < 1 || Number(formVal.txtExpirationMM) > 12) {
    //   GeneralOperation.showAlertPopUp(this.ngbModal, 'CC Payment', 'Please enter Valid Expiration Month.', AlertTypeEnum.DANGER);
    //   return;
    // }
    // else if (formVal.txtExpirationYY == undefined || formVal.txtExpirationYY.trim() == ''
    //   || Number(formVal.txtExpirationYY) == NaN
    //   || Number(formVal.txtExpirationYY) < CurrentYY) {
    //   GeneralOperation.showAlertPopUp(this.ngbModal, 'CC Payment', 'Please enter Valid Expiration Year.', AlertTypeEnum.DANGER);
    //   return;
    // }
    else if (formVal.txtCardHolderName == undefined || formVal.txtCardHolderName.trim() == '') {
      GeneralOperation.showAlertPopUp(this.ngbModal, 'CC Payment', 'Please enter Card Holder Full Name.', AlertTypeEnum.DANGER);
      return;
    }

    this.streetAddress1 = formVal.txtStreetAddress1;
    this.streetAddress2 = formVal.txtStreetAddress2;
    this.city = formVal.txtCity;
    this.state = formVal.txtState;
    this.zip = formVal.txtZipCode;


    this.isCCInfoView = true;

    /*
    let ccPaymentModel: CCPaymentModel = new CCPaymentModel();

    ccPaymentModel.charges = this.paymentAmount;
    ccPaymentModel.cc_number = formVal.txtCardNo;
    ccPaymentModel.cc_expiration_mm = formVal.txtExpirationMM;
    ccPaymentModel.cc_expiration_yyyy = this.dateTimeUtil.convertDateTimeFormat(formVal.txtExpirationYY, DateTimeFormat.DATEFORMAT_YY, DateTimeFormat.DATEFORMAT_YYYY);
    ccPaymentModel.cvc = formVal.txtCVC;
    ccPaymentModel.card_holder_name = formVal.txtCardHolderName;

    ccPaymentModel.street_address1 = formVal.txtStreetAddress1;
    ccPaymentModel.street_address2 = formVal.txtStreetAddress2;
    ccPaymentModel.city = formVal.txtCity;
    ccPaymentModel.state = formVal.txtState;
    ccPaymentModel.zip = formVal.txtZipCode;

    ccPaymentModel.service_name = this.lookupList.ccPaymentServiceName;


    console.log(ccPaymentModel);


    debugger;

    let key = this.encryptDecryptService.getBasehKey() + this.patientId;

    var encrypted = this.encryptDecryptService.set(key, JSON.stringify(ccPaymentModel));
    //var decrypted = this.encryptDecryptService.get('123456$#@$^@1ERF', encrypted);


    //console.log('Encrypted:' + encrypted);
    //console.log('Decrypted:' + decrypted);

    this.activeModal.close(encrypted);
    */
  }

  //showCCInfoView() {
  //  this.isCCInfoView = true;
    //this.buildCCPaymentForm();    
 // }

  ccFormCallBack(resp: any) {

    debugger;
    switch (resp.status) {
      case PromptResponseEnum.SUCCESS:
        //alert('Single Use Token: ' + resp.token_value);
        //GeneralOperation.showAlertPopUp(this.ngbModal, "Single Use Token: ", resp.token, AlertTypeEnum.SUCCESS)
        this.postBackToken(resp.token);
        break;
      case PromptResponseEnum.ERROR:
        //alert('Error: ' + resp.error);
        GeneralOperation.showAlertPopUp(this.ngbModal, "Credit Card Payment", resp.error, AlertTypeEnum.DANGER)
        break;
      case PromptResponseEnum.CANCEL:
        this.isCCInfoView = false;
        break;

      default:
        break;
    }

  }

  postBackToken(token: any) {


    debugger;
    let ccPaymentModel: CCPaymentModel = new CCPaymentModel();
    ccPaymentModel.token = token;
    ccPaymentModel.charges = this.paymentAmount;
    //ccPaymentModel.cc_number = formVal.txtCardNo;
    //ccPaymentModel.cc_expiration_mm = formVal.txtExpirationMM;
    //ccPaymentModel.cc_expiration_yyyy = this.dateTimeUtil.convertDateTimeFormat(formVal.txtExpirationYY, DateTimeFormat.DATEFORMAT_YY, DateTimeFormat.DATEFORMAT_YYYY);
    //ccPaymentModel.cvc = formVal.txtCVC;
    //ccPaymentModel.card_holder_name = formVal.txtCardHolderName;

    ccPaymentModel.street_address1 = this.streetAddress1;
    ccPaymentModel.street_address2 = this.streetAddress2;
    ccPaymentModel.city = this.city;
    ccPaymentModel.state = this.state;
    ccPaymentModel.zip = this.zip;

    ccPaymentModel.service_name = this.lookupList.ccPaymentServiceName;


    //console.log(ccPaymentModel);


    debugger;

    let key = this.encryptDecryptService.getBasehKey() + this.patientId;

    var encrypted = this.encryptDecryptService.set(key, JSON.stringify(ccPaymentModel));
    //var decrypted = this.encryptDecryptService.get('123456$#@$^@1ERF', encrypted);


    //console.log('Encrypted:' + encrypted);
    //console.log('Decrypted:' + decrypted);

    this.activeModal.close(encrypted);


  }


}
