import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { DecimalPipe } from '@angular/common';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custome-validators';
import { CallingFromEnum, AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { WrapperPatientRefundSave } from 'src/app/models/billing/wrapper-patient-refund-save';
import { ORMCreditCardPayment } from 'src/app/models/billing/orm-credit-card-payment';
import { OrmClaimPaymentSave } from 'src/app/models/billing/orm-claim-payment-save';
import { listFilterWithNumericCondition } from 'src/app/shared/list-filter-with-numeric-condition';
import { UniquePipe } from 'src/app/shared/unique-pipe';
import { ORMPatientRefundSave } from 'src/app/models/billing/orm-patient-refund-save';
import { PaymentService } from 'src/app/services/billing/payment.service';

@Component({
  selector: 'app-refund-patient-payment',
  templateUrl: './refund-patient-payment.component.html',
  styleUrls: ['./refund-patient-payment.component.css']
})
export class RefundPatientPaymentComponent implements OnInit {


  @Input() patientId: number;
  @Input() locationId: number;
  @Input() claimId: number;
  @Input() cashRegisterId: number;
  @Input() callingFrom: CallingFromEnum;
  //@Input() totalRefund: number = 0;  
  @Input() totalPatientPaid: number = 0;
  @Input() prevRefunded: number = 0;

  totalRefund: number = 0;
  currentRefund: number = 0;

  isLoading: boolean = false;
  lstClaimProcedures: Array<any>;
  paymentMethod: string = "CASH";

  lstPaymentMethods: Array<string> = ["CASH", "CHECK", "MONEY ORDER", "CREDIT CARD"];

  formGroup: FormGroup;

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private paymentService: PaymentService,
    private logMessage: LogMessage,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe,
    private ngbModal: NgbModal) { }
    
    @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  ngOnInit() {

    this.currentRefund = this.totalPatientPaid - this.prevRefunded;
    this.totalRefund = this.totalPatientPaid;

    this.getProceduresForPatientRefund();
    this.buildForm();
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      ddLocation: this.formBuilder.control(this.locationId, Validators.required),
      ddRefundMethod: this.formBuilder.control("CASH", Validators.required),
      txtCheckNumber: this.formBuilder.control(null),
      dpCheckDate: this.formBuilder.control(null),
      txtTransactionNumber: this.formBuilder.control(null),
      txtAuthorizationCode: this.formBuilder.control(null),
      txtComments: this.formBuilder.control(null, Validators.required)
    },
      {
        validator: Validators.compose([
          CustomValidators.requiredWhenOneOptionWithValue('txtCheckNumber', 'ddRefundMethod', 'CHECK'),
          CustomValidators.requiredWhenOneOptionWithValue('dpCheckDate', 'ddRefundMethod', 'CHECK'),
          CustomValidators.requiredWhenOneOptionWithValue('txtAuthorizationCode', 'ddRefundMethod', 'CREDIT CARD')
        ])
      }
    );
  }

  getProceduresForPatientRefund() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.patientId, option: '' },
      { name: "claim_id", value: this.claimId != undefined ? this.claimId : '', option: "" },
      { name: "cash_register_id", value: this.cashRegisterId != undefined ? this.cashRegisterId : "", option: "" }
    ];

    this.paymentService.getProceduresForPatientRefund(searchCriteria).subscribe(
      data => {
        debugger;
        let claimProcedures: Array<any> = data as Array<any>;

        this.lstClaimProcedures = new listFilterWithNumericCondition().transform(claimProcedures, "patient_paid", ">", 0);

        this.assignValues();
      },
      error => {
        this.getProceduresForPatientRefundError(error);
      }
    );
  }

  getProceduresForPatientRefundError(error) {
    this.logMessage.log("getProceduresForPatientRefund Error." + error);
  }

  assignValues() {
    debugger;


    //this.totalPatientPaid = 0;

    if (this.callingFrom == CallingFromEnum.CLAIM_PAYMENT) {

      this.totalPatientPaid = 0;
      if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

        this.lstClaimProcedures.forEach(proc => {
          debugger;
          if (proc.patient_paid != undefined && proc.patient_paid != null) {

            let cptPatPaid = GeneralOperation.getCurrencyNumbersOnly(proc.patient_paid);

            this.totalPatientPaid += Number(cptPatPaid);

            let formatedValue = "";
            if (!isNaN(cptPatPaid)) {

              formatedValue = this.decimalPipe.transform(cptPatPaid, ".2-2", "");
              proc.refund_amount = formatedValue;
            }
            else {
              proc.refund_amount = "";
            }

          }
        });

      }
      this.CalculateRefund();
    }
  }



  formateCurrencyInputs(element: HTMLInputElement, claimProcId: number, feildeName: string) {

    let value: any = element.value;
    let formatedValue = "";
    if (!isNaN(value)) {

      formatedValue = this.decimalPipe.transform(value, ".2-2", "");
      element.value = formatedValue;
    }
    else {
      element.value = "";

    }

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {

        if (proc.claim_procedures_id == claimProcId) {
          proc[feildeName] = formatedValue;
        }
      });

      this.CalculateRefund();
    }

  }

  CalculateRefund() {

    debugger;
    this.totalRefund = 0;
    this.currentRefund = 0;


    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {

        debugger;
        let refund: number = 0;
        let paid: number = 0;

        if (proc.patient_paid != undefined && proc.patient_paid != null) {

          let patPaid = GeneralOperation.getCurrencyNumbersOnly(proc.patient_paid);

          if (Number(patPaid) != NaN) {
            paid = Number(patPaid);
          }

        }
        if (proc.refund_amount != undefined && proc.refund_amount != null) {

          let patRefund = GeneralOperation.getCurrencyNumbersOnly(proc.refund_amount);

          if (Number(patRefund) != NaN && Number(patRefund) > 0) {
            refund = Number(patRefund);
            this.currentRefund += refund;
          }
        }

        if (refund > paid) {
          proc.invalid = true;
        }
        else {
          proc.invalid = false;
        }

      });

    }


    this.totalRefund = this.prevRefunded + this.currentRefund;
  }


  paymentMethodChagned(method: string) {
    this.paymentMethod = method;
  }


  onSubmit(formData: any) {


    if (this.validateData()) {


      debugger;
      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


      let ormCreditCardPayment: ORMCreditCardPayment;
      let ormPatientRefundSave = new ORMPatientRefundSave();
      let lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
      let lstKV: Array<ORMKeyValue>;


      ormPatientRefundSave.cash_register_id = this.cashRegisterId;
      ormPatientRefundSave.patient_id = this.patientId;
      ormPatientRefundSave.location_id = formData.ddLocation;
      ormPatientRefundSave.refund_method = formData.ddRefundMethod;
      ormPatientRefundSave.notes = formData.txtComments;
      ormPatientRefundSave.practice_id = this.lookupList.practiceInfo.practiceId;
      ormPatientRefundSave.system_ip = this.lookupList.logedInUser.systemIp;
      ormPatientRefundSave.created_user = this.lookupList.logedInUser.user_name;
      ormPatientRefundSave.modified_user = this.lookupList.logedInUser.user_name;
      ormPatientRefundSave.client_date_created = clientDateTime;
      ormPatientRefundSave.client_date_modified = clientDateTime;

      if (formData.ddRefundMethod == "CHECK") {
        ormPatientRefundSave.check_number = formData.txtCheckNumber;
        ormPatientRefundSave.check_date = formData.dpCheckDate;
      }
      else if (formData.ddRefundMethod == "CREDIT CARD") {

        ormPatientRefundSave.transaction_id = formData.txtTransactionNumber;
        ormPatientRefundSave.authcode = formData.txtAuthorizationCode;


        ormCreditCardPayment = new ORMCreditCardPayment();
        ormCreditCardPayment.client_date_created = clientDateTime;
        ormCreditCardPayment.client_date_modified = clientDateTime;
        ormCreditCardPayment.comments = "REFUND";
        ormCreditCardPayment.transaction_id = formData.txtTransactionNumber;
        ormCreditCardPayment.authcode = formData.txtAuthorizationCode;
        ormCreditCardPayment.practice_id = this.lookupList.practiceInfo.practiceId;
        ormCreditCardPayment.patient_id = this.patientId;
        ormCreditCardPayment.created_user = this.lookupList.logedInUser.user_name;
        ormCreditCardPayment.modified_user = this.lookupList.logedInUser.user_name;

      }


      ormPatientRefundSave.refund_amount = this.currentRefund;

      let lstDateOfServices: Array<any> = new Array();

      if (this.lstClaimProcedures != undefined) {


        for (let i: number = 0; i < this.lstClaimProcedures.length; i++) {

          if (this.callingFrom == CallingFromEnum.CASH_REGISTER && this.currentRefund <= 0) {
            break;
          }



          let proc: any = this.lstClaimProcedures[i];

          lstDateOfServices.push({ dos: proc.dos });

          let patPaid: number = GeneralOperation.getCurrencyNumbersOnly(proc.patient_paid);
          let refundAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.refund_amount);

          if (
            (this.callingFrom == CallingFromEnum.CASH_REGISTER && patPaid > 0)
            || refundAmount > 0
          ) {

            let ormClaimPaymentSave: OrmClaimPaymentSave = new OrmClaimPaymentSave();

            ormClaimPaymentSave.claim_procedures_id = proc.claim_procedures_id;
            ormClaimPaymentSave.patient_id = this.patientId
            ormClaimPaymentSave.claim_id = proc.claim_id;
            ormClaimPaymentSave.payment_source = "Patient";
            ormClaimPaymentSave.charged_procedure = proc.proc_code;
            ormClaimPaymentSave.paid_procedure = proc.proc_code;
            ormClaimPaymentSave.units = proc.units;

            debugger;
            if (formData.ddRefundMethod == "CHECK") {
              ormClaimPaymentSave.check_number = formData.txtCheckNumber;
              ormClaimPaymentSave.check_date = formData.dpCheckDate;
            }

            if (this.callingFrom == CallingFromEnum.CASH_REGISTER) {

              if (patPaid > 0) {

                if (patPaid <= this.currentRefund) {
                  ormClaimPaymentSave.paid_amount = -1 * patPaid;
                  this.currentRefund = this.currentRefund - patPaid;
                }
                else {
                  ormClaimPaymentSave.paid_amount = -1 * (patPaid - this.currentRefund);
                  this.currentRefund = 0;
                }
              }
            }
            else {
              ormClaimPaymentSave.paid_amount = -1 * refundAmount;
            }


            ormClaimPaymentSave.eob_era_id_type = "PATIENT_REFUND";
            ormClaimPaymentSave.practice_id = this.lookupList.practiceInfo.practiceId;
            ormClaimPaymentSave.autoposted_era = false;
            ormClaimPaymentSave.created_user = this.lookupList.logedInUser.user_name;
            ormClaimPaymentSave.client_date_created = clientDateTime;
            ormClaimPaymentSave.modified_user = this.lookupList.logedInUser.user_name;
            ormClaimPaymentSave.client_date_modified = clientDateTime;
            ormClaimPaymentSave.system_ip = this.lookupList.logedInUser.systemIp;
            ormClaimPaymentSave.entry_type = "Patient Refund";

            if (lstClaimPaymentSave == undefined) {
              lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
            }

            lstClaimPaymentSave.push(ormClaimPaymentSave);

          }
        }
      }



      if (lstDateOfServices != undefined && lstDateOfServices.length > 0) {
        if (this.callingFrom == CallingFromEnum.CLAIM_PAYMENT) {

          let dosString: string = "";
          let distinctDOS: Array<any> = new UniquePipe().transform(lstDateOfServices, "dos");

          distinctDOS.forEach(element => {
            if (dosString != "")
              dosString += ", "
            dosString += element.dos;
          });
          let ormKV: ORMKeyValue = new ORMKeyValue("CLAIM_NOTE", "A total of $" + this.decimalPipe.transform(this.currentRefund, ".2-2", "") + " has been refunded to Patient by " + formData.ddRefundMethod + " from DOS : " + dosString);
          lstKV = new Array<ORMKeyValue>();
          lstKV.push(ormKV);
        }
      }



      let wrapperPatientRefundSave: WrapperPatientRefundSave = new WrapperPatientRefundSave(ormPatientRefundSave, ormCreditCardPayment, lstClaimPaymentSave, lstKV);

      debugger;
      if (wrapperPatientRefundSave != undefined) {


        this.paymentService.refundPatientPayment(wrapperPatientRefundSave).subscribe(
          data => {

            this.refundPatientPaymentSuccess(data);
          },
          error => {
            this.refundPatientPaymentError(error);
          }
        );

      }
      else {
        GeneralOperation.showAlertPopUp(this.ngbModal, 'Refund Patient Payment', "There no amount to refund.", AlertTypeEnum.INFO)
      }
    }

  }

  refundPatientPaymentSuccess(data: any) {
    debugger;
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Refund Patient Payment', data.response, AlertTypeEnum.DANGER)
    }
  }

  refundPatientPaymentError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Refund Patient Payment', "An Error Occured while saving Patient Refund", AlertTypeEnum.DANGER)
  }

  validateData() {

    debugger;
    let strMsg: string = "";

    if (this.callingFrom == CallingFromEnum.CLAIM_PAYMENT) {

      if (this.currentRefund == undefined || this.currentRefund <= 0) {
        strMsg = "No amount is entered for refund."
      }

      let invalidCpts: string = "";
      if (this.lstClaimProcedures != undefined) {
        this.lstClaimProcedures.forEach(proc => {

          if (proc.invalid != undefined && proc.invalid == true) {
            if (invalidCpts != "") {
              invalidCpts += ",";
            }
            invalidCpts += proc.proc_code;
          }

        });
      }

      if (invalidCpts != "") {
        strMsg = "Refund Amount can't exeed CPT Paid amount.<br>" + invalidCpts;
      }
    }
    else if (this.callingFrom == CallingFromEnum.CASH_REGISTER) {

      if (this.currentRefund == undefined || this.currentRefund <= 0) {
        strMsg = "No amount is entered for refund."
      }

    }

    if (strMsg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Refund Patient Payment', strMsg, AlertTypeEnum.DANGER)

      /*
      const modalRef = this.ngbModal.open(AlertPopupComponent, this.popUpOptions);
      modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;
      modalRef.componentInstance.promptHeading = 'Refund Patient Payment';
      modalRef.componentInstance.promptMessage = strMsg;
*/
      return false;
    }
    else {
      return true;
    }

  }


}
