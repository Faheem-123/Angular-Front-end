import { Component, OnInit, Input, Inject, HostListener } from '@angular/core';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LookupList, LOOKUP_LIST } from 'src/app/providers/lookupList.module';
import { ClaimService } from 'src/app/services/billing/claim.service';
import { LogMessage } from 'src/app/shared/log-message';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { DecimalPipe } from '@angular/common';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { AlertTypeEnum, ServiceResponseStatusEnum } from 'src/app/shared/enum-util';
import { WrapperClaimPaymentSave } from 'src/app/models/billing/wrapper-claim-payment-save';
import { OrmClaimPaymentSave } from 'src/app/models/billing/orm-claim-payment-save';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { GeneralOperation } from 'src/app/shared/generalOperation';

@Component({
  selector: 'transfer-claim-posted-patient-payment',
  templateUrl: './transfer-claim-posted-patient-payment.component.html',
  styleUrls: ['./transfer-claim-posted-patient-payment.component.css']
})
export class TransferClaimPostedPatientPaymentComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;
  @Input() sourcePayment: any;

  total_paid: number;
  total_writeOff: number;

  isLoading: boolean = false;
  lstClaims: Array<any>;
  lstClaimProcedures: Array<any>;

  total_paid_transfer: number = 0;
  total_writeOff_transfer: number = 0;

  destinationClaim: any;


  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  constructor(public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private claimService: ClaimService,
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

    debugger;
    this.isLoading = true;
    this.total_paid = (Number(this.sourcePayment.paid_amount) == NaN || this.sourcePayment.paid_amount == "") ? 0 : Number(this.sourcePayment.paid_amount);
    this.total_writeOff = (Number(this.sourcePayment.writeoff_amount) == NaN || this.sourcePayment.writeoff_amount == "") ? 0 : Number(this.sourcePayment.writeoff_amount);

    this.getclaimSummary();
  }


  getclaimSummary() {

    this.claimService.getClaimSummary(this.openedClaimInfo.patientId, true, false).subscribe(
      data => {
        this.isLoading = false;
        this.lstClaims = data as Array<any>;
      },
      error => {
        this.isLoading = false;
        this.getClaimSummaryError(error);
      }
    );

  }
  getClaimSummaryError(error: any) {
    this.logMessage.log("transfer-claim-payment:-" + error);
  }


  getProceduresForPosting(index: number) {

    this.destinationClaim = this.lstClaims[index - 1];// as index 0 is heading

    debugger;
    this.total_paid_transfer = 0;
    this.total_writeOff_transfer = 0;
    this.lstClaimProcedures = undefined;

    //this.destinationClaimId = claim.claim_id;
    //this.destinationClaimDue = claim.amt_due;

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.openedClaimInfo.patientId, option: "" },
      { name: "claim_id", value: this.destinationClaim.claim_id, option: "" },
      { name: "dos", value: "", option: "" },
      { name: "provider_id", value: "", option: "" },
      { name: "location_id", value: "", option: "" },
      { name: "cash_register_id", value: "", option: "" }
    ];


    this.paymentService.getProceduresForPosting(searchCriteria).subscribe(
      data => {
        this.lstClaimProcedures = data as Array<any>;
      },
      error => {
        this.getProceduresForPostingError(error);
      }
    );
  }

  getProceduresForPostingError(error) {
    this.logMessage.log("getProceduresForPosting Error." + error);
  }


  CalculateTransfer() {
    this.total_paid_transfer = 0;
    this.total_writeOff_transfer = 0;

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {

        let paid: number = 0;
        let write_off: number = 0;

        if (proc.paid_amount != undefined && proc.paid_amount != null) {

          let transferAmount = GeneralOperation.getCurrencyNumbersOnly(proc.paid_amount);

          if (Number(transferAmount) != NaN && Number(transferAmount) > 0) {
            paid = Number(transferAmount);
            this.total_paid_transfer += Number(proc.paid_amount);
          }

        }
        if (proc.write_off != undefined && proc.write_off != null) {

          let writeOffAmount = GeneralOperation.getCurrencyNumbersOnly(proc.write_off);

          if (Number(writeOffAmount) != NaN && Number(writeOffAmount) > 0) {
            write_off = Number(proc.write_off);
            this.total_writeOff_transfer += Number(proc.write_off);
          }
        }

        if (proc.cpt_balance < (paid + write_off)) {
          proc.invalid = true;
        }
        else {
          proc.invalid = false;
        }

      });

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

      this.CalculateTransfer();
    }

  }

  transferPayment() {
    if (this.validateData()) {

      debugger;
      let wrapperClaimPaymentSave: WrapperClaimPaymentSave;
      let lstClaimPaymentSave: Array<OrmClaimPaymentSave>;

      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);


      let tempPaymentId: number = -1;

      if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

        this.lstClaimProcedures.forEach(payment => {

          if ((payment.paid_amount != undefined && payment.paid_amount > 0)
            || (payment.write_off != undefined && payment.write_off > 0)
          ) {

            let paid: number = 0;
            let write_off: number = 0;

            debugger;
            if (payment.paid_amount != undefined && Number(payment.paid_amount) != NaN && Number(payment.paid_amount) > 0) {

              paid = Number(payment.paid_amount);
            }
            if (payment.write_off != undefined && Number(payment.write_off) != NaN && Number(payment.write_off) > 0) {
              write_off = Number(payment.write_off);
            }

            let ormClaimPaymentSave: OrmClaimPaymentSave = new OrmClaimPaymentSave();

            ormClaimPaymentSave.claim_payments_id = tempPaymentId--;
            ormClaimPaymentSave.claim_procedures_id = payment.claim_procedures_id;
            ormClaimPaymentSave.patient_id = this.openedClaimInfo.patientId;
            ormClaimPaymentSave.claim_id = this.destinationClaim.claim_id;
            ormClaimPaymentSave.payment_source = "Patient";
            ormClaimPaymentSave.charged_procedure = payment.proc_code;
            ormClaimPaymentSave.paid_procedure = payment.proc_code;
            ormClaimPaymentSave.units = payment.units;

            if (this.sourcePayment.check_date != undefined && this.sourcePayment.check_date != "") {
              ormClaimPaymentSave.check_date = this.sourcePayment.check_date;
              ormClaimPaymentSave.check_number = this.sourcePayment.check_date;
            }


            ormClaimPaymentSave.paid_amount = paid;
            ormClaimPaymentSave.writeoff_amount = write_off;
            ormClaimPaymentSave.eob_era_id = this.sourcePayment.eob_era_id;
            ormClaimPaymentSave.practice_id = this.lookupList.practiceInfo.practiceId;
            ormClaimPaymentSave.autoposted_era = false;
            ormClaimPaymentSave.created_user = this.lookupList.logedInUser.user_name;
            ormClaimPaymentSave.client_date_created = clientDateTime;
            ormClaimPaymentSave.modified_user = this.lookupList.logedInUser.user_name;
            ormClaimPaymentSave.client_date_modified = clientDateTime;
            ormClaimPaymentSave.system_ip = this.lookupList.logedInUser.systemIp;
            ormClaimPaymentSave.eob_era_id_type = this.sourcePayment.eob_era_id_type;
            ormClaimPaymentSave.eob_page_no = this.sourcePayment.eob_page_no;
            ormClaimPaymentSave.entry_type = "Payment Transfer";

            if (lstClaimPaymentSave == undefined) {
              lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
            }

            lstClaimPaymentSave.push(ormClaimPaymentSave);
          }

        });


        debugger;
        // add rectification entry for source payment
        let ormClaimPaymentSave: OrmClaimPaymentSave = new OrmClaimPaymentSave();

        ormClaimPaymentSave.claim_payments_id = tempPaymentId--;
        ormClaimPaymentSave.claim_procedures_id = this.sourcePayment.claim_procedures_id;
        ormClaimPaymentSave.patient_id = this.openedClaimInfo.patientId;
        ormClaimPaymentSave.claim_id = this.openedClaimInfo.claimId;
        ormClaimPaymentSave.payment_source = "Patient";
        ormClaimPaymentSave.charged_procedure = this.sourcePayment.charged_procedure;
        ormClaimPaymentSave.paid_procedure = this.sourcePayment.paid_procedure;
        ormClaimPaymentSave.units = this.sourcePayment.units;

        ormClaimPaymentSave.check_date = this.sourcePayment.check_date;
        ormClaimPaymentSave.check_number = this.sourcePayment.check_date;


        ormClaimPaymentSave.paid_amount = -1 * this.total_paid_transfer;
        ormClaimPaymentSave.writeoff_amount = -1 * this.total_writeOff_transfer;
        ormClaimPaymentSave.eob_era_id = this.sourcePayment.eob_era_id;
        ormClaimPaymentSave.practice_id = this.lookupList.practiceInfo.practiceId;
        ormClaimPaymentSave.autoposted_era = false;
        ormClaimPaymentSave.created_user = this.lookupList.logedInUser.user_name;
        ormClaimPaymentSave.client_date_created = clientDateTime;
        ormClaimPaymentSave.modified_user = this.lookupList.logedInUser.user_name;
        ormClaimPaymentSave.client_date_modified = clientDateTime;
        ormClaimPaymentSave.system_ip = this.lookupList.logedInUser.systemIp;
        ormClaimPaymentSave.eob_era_id_type = this.sourcePayment.eob_era_id_type;
        ormClaimPaymentSave.eob_page_no = this.sourcePayment.eob_page_no;
        ormClaimPaymentSave.entry_type = "Payment Transfer";

        if (lstClaimPaymentSave == undefined) {
          lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
        }

        lstClaimPaymentSave.push(ormClaimPaymentSave);


        let ormKV: ORMKeyValue = new ORMKeyValue("CLAIM_NOTE", "$" + (this.total_paid_transfer + this.total_writeOff_transfer) + " has been tranferred from DOS:" + this.openedClaimInfo.dos + " to DOS:" + this.destinationClaim.dos);
        let lstKV: Array<ORMKeyValue> = new Array<ORMKeyValue>();
        lstKV.push(ormKV);

        wrapperClaimPaymentSave = new WrapperClaimPaymentSave(lstClaimPaymentSave, undefined, lstKV,undefined);


        if (wrapperClaimPaymentSave != undefined && wrapperClaimPaymentSave.lstClaimPaymentSave != undefined && wrapperClaimPaymentSave.lstClaimPaymentSave.length > 0) {


          this.paymentService.saveClaimPayment(wrapperClaimPaymentSave).subscribe(
            data => {

              this.saveClaimPaymentSuccess(data);
            },
            error => {
              this.saveClaimPaymentError(error);
            }
          );

        }
        else {

          GeneralOperation.showAlertPopUp(this.ngbModal, "Transfer Patient Payment", "There is not payment to save.", AlertTypeEnum.INFO)

        }

      }

    }
  }


  saveClaimPaymentSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, "Transfer Patient Payment", data.response, AlertTypeEnum.DANGER);

    }
  }

  saveClaimPaymentError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, "Transfer Patient Payment", "An Error Occured while saving.", AlertTypeEnum.DANGER);

  }

  validateData() {

    let strMsg: string = "";

    if (this.destinationClaim == undefined) {
      strMsg = "No Claim is selected."
    }
    else if (this.total_paid_transfer <= 0 && this.total_writeOff_transfer <= 0) {
      strMsg = "Please enter payment/write off to transfer."
    }    
    else if (this.total_paid_transfer > this.total_paid) {
      strMsg = "Pyament to be transferred is greater than actual payment."
    }
    else if (this.total_writeOff_transfer > this.total_writeOff) {
      strMsg = "Write Off to be transferred is greater than actual Write Off."
    }
    else if ((this.total_writeOff_transfer + this.total_paid_transfer) > this.destinationClaim.amt_due) {
      strMsg = "Total Transfer Amount can't exceed total claim due."
    }
    else {
      this.lstClaimProcedures.forEach(proc => {
        if (proc.invalid) {
          if (strMsg != "") {
            strMsg += ", "
          }
          strMsg += proc.proc_code;
        }
      });

      if (strMsg != "") {
        strMsg = "CPT(s) Balance is less than payment/write off.<br>" + strMsg;
      }
    }

    if (strMsg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, "Transfer Patient Payment", strMsg, AlertTypeEnum.DANGER);

      return false;
    }
    else {
      return true;
    }

  }

}
