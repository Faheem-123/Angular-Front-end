import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LOOKUP_LIST, LookupList } from 'src/app/providers/lookupList.module';
import { LogMessage } from 'src/app/shared/log-message';
import { PaymentService } from 'src/app/services/billing/payment.service';
import { DateTimeUtil, DateTimeFormat } from 'src/app/shared/date-time-util';
import { DecimalPipe } from '@angular/common';
import { ORMKeyValue } from 'src/app/models/general/orm-key-value';
import { SearchCriteria } from 'src/app/models/common/search-criteria';
import { listFilterWithNumericCondition } from 'src/app/shared/list-filter-with-numeric-condition';
import { OpenedClaimInfo } from 'src/app/models/billing/opened-claim-info';
import { GeneralOperation } from 'src/app/shared/generalOperation';
import { AlertTypeEnum, ServiceResponseStatusEnum, PromptResponseEnum } from 'src/app/shared/enum-util';
import { OrmClaimPaymentSave } from 'src/app/models/billing/orm-claim-payment-save';
import { WrapperClaimPaymentSave } from 'src/app/models/billing/wrapper-claim-payment-save';
import { ConfirmationPopupComponent } from 'src/app/general-modules/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'import-cash-register-payment',
  templateUrl: './import-cash-register-payment.component.html',
  styleUrls: ['./import-cash-register-payment.component.css']
})
export class ImportCashRegisterPaymentComponent implements OnInit {

  @Input() openedClaimInfo: OpenedClaimInfo;

  lstUnResolvedCashRegisterEntries: Array<any>;
  lstClaimProcedures: Array<any>;
  dosOption: string = "current";


  isLoading: boolean = false;
  loadingCount: number = 0;
  isUnReslovedLoading: boolean = false;

  totalPendingPayment: number = 0;
  totalPendingWriteOff: number = 0;
  totalPendingPrevPayment: number = 0;
  totalPendingPrevWriteOff: number = 0;

  totalPaymentToPost: number = 0;
  totalWriteOffToPost: number = 0;
  totalPrevPaymentToPost: number = 0;
  totalPrevWriteOffToPost: number = 0;

  selectedCashRegisterId: number = 0;
  checkNo: string;
  checkDate: string;

  constructor(public activeModal: NgbActiveModal,
    @Inject(LOOKUP_LIST) public lookupList: LookupList,
    private logMessage: LogMessage,
    private paymentService: PaymentService,
    private dateTimeUtil: DateTimeUtil,
    private decimalPipe: DecimalPipe,
    private ngbModal: NgbModal) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadingCount = 2;
    this.getProceduresForPosting();
    this.getUnResolvedPayments(this.openedClaimInfo.patientId, this.openedClaimInfo.dos);
  }

  popUpOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: true
  };
  @HostListener('document:keydown.escape', ['$event']) 
		onKeydownHandler(event: KeyboardEvent) {
		  this.activeModal.dismiss('Cross click')
		}
  getProceduresForPosting() {

    let searchCriteria: SearchCriteria = new SearchCriteria();
    searchCriteria.practice_id = this.lookupList.practiceInfo.practiceId;
    searchCriteria.param_list = [
      { name: "patient_id", value: this.openedClaimInfo.patientId, option: "" },
      { name: "claim_id", value: this.openedClaimInfo.claimId, option: "" },
      { name: "dos", value: "", option: "" },
      { name: "provider_id", value: "", option: "" },
      { name: "location_id", value: "", option: "" },
      { name: "cash_register_id", value: "", option: "" }
    ];


    this.paymentService.getProceduresForPosting(searchCriteria).subscribe(
      data => {
        debugger;
        //let claimProcedures: Array<any> = data as Array<any>;
        this.lstClaimProcedures = data as Array<any>;
        //this.lstClaimProcedures = new listFilterWithNumericCondition().transform(claimProcedures, "cpt_balance", ">", 0);

        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.isLoading = false;
          this.assignValues(undefined);
        }

      },
      error => {
        this.getProceduresForPostingError(error);
        this.isLoading = false;
      }
    );
  }

  getProceduresForPostingError(error) {
    this.logMessage.log("getProceduresForPosting Error." + error);
  }

  getUnResolvedPayments(patId: number, dos: string) {

    this.lstUnResolvedCashRegisterEntries = undefined;

    let lstKeyValue: Array<ORMKeyValue> = new Array();
    lstKeyValue.push(new ORMKeyValue("patient_id", patId));
    lstKeyValue.push(new ORMKeyValue("dos", dos));


    this.paymentService.getUnResolvedCashRegisterPayments(lstKeyValue).subscribe(
      data => {
        this.lstUnResolvedCashRegisterEntries = data as Array<any>;
        this.loadingCount--;
        if (this.loadingCount <= 0) {
          this.isLoading = false;
          this.assignValues(undefined);
        }



        this.isUnReslovedLoading = false;
      },
      error => {
        this.getProceduresForPostingError(error);
        this.isLoading = false;
        this.isUnReslovedLoading = false;
      }
    );
  }

  assignValues(cashRegEntry: any) {

    this.clearPayments();

    let objCash: any;
    if (cashRegEntry == undefined) {
      if (this.lstUnResolvedCashRegisterEntries != undefined && this.lstUnResolvedCashRegisterEntries.length > 0) {
        objCash = this.lstUnResolvedCashRegisterEntries[0];
      }
    }
    else {
      objCash = cashRegEntry;
    }

    if (objCash != undefined) {
      this.selectedCashRegisterId = objCash.cash_register_id;
      this.totalPendingPayment = GeneralOperation.getCurrencyNumbersOnly(objCash.paid_pending)
      this.totalPendingWriteOff = GeneralOperation.getCurrencyNumbersOnly(objCash.write_off_pending)
      this.totalPendingPrevPayment = GeneralOperation.getCurrencyNumbersOnly(objCash.prev_paid_pending)
      this.totalPendingPrevWriteOff = GeneralOperation.getCurrencyNumbersOnly(objCash.prev_write_off_pending)
      this.checkDate = objCash.check_date;
      this.checkNo = objCash.check_number;
    }
  }

  clearPayments() {

    this.selectedCashRegisterId = undefined;
    this.checkDate = undefined;
    this.checkNo = undefined;

    this.totalPendingPayment = 0;
    this.totalPendingWriteOff = 0;
    this.totalPendingPrevPayment = 0;
    this.totalPendingPrevWriteOff = 0;

    this.totalPaymentToPost = 0;
    this.totalWriteOffToPost = 0;
    this.totalPrevPaymentToPost = 0;
    this.totalPrevWriteOffToPost = 0;

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {
        proc.paid_amount = 0;
        proc.write_off = 0;
        proc.prev_paid_amount = 0;
        proc.prev_write_off = 0;

        if ((<HTMLInputElement>document.getElementById("txtPaid" + proc.claim_procedures_id)) != null) {
          (<HTMLInputElement>document.getElementById("txtPaid" + proc.claim_procedures_id)).value = "0.00";
        }
        if ((<HTMLInputElement>document.getElementById("txtWO" + proc.claim_procedures_id)) != null) {
          (<HTMLInputElement>document.getElementById("txtWO" + proc.claim_procedures_id)).value = "0.00";
        }
        if ((<HTMLInputElement>document.getElementById("txtPrevPaid" + proc.claim_procedures_id)) != null) {
          (<HTMLInputElement>document.getElementById("txtPrevPaid" + proc.claim_procedures_id)).value = "0.00";
        }
        if ((<HTMLInputElement>document.getElementById("txtPrevWO" + proc.claim_procedures_id)) != null) {
          (<HTMLInputElement>document.getElementById("txtPrevWO" + proc.claim_procedures_id)).value = "0.00";
        }

      });
    }
  }

  onDOSOptionChange(event: any) {


    this.clearPayments();
    if (event == "current") {
      this.loadingCount = 1;
      this.isUnReslovedLoading = true;
      this.getUnResolvedPayments(this.openedClaimInfo.patientId, this.openedClaimInfo.dos);
    }
    else if (event == "all") {
      this.loadingCount = 1;
      this.isUnReslovedLoading = true;
      this.getUnResolvedPayments(this.openedClaimInfo.patientId, "");
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

      this.calculateTotalPosting();
    }

  }

  calculateTotalPosting() {

    this.totalPaymentToPost = 0;
    this.totalWriteOffToPost = 0;
    this.totalPrevPaymentToPost = 0;
    this.totalPrevWriteOffToPost = 0;

    if (this.lstClaimProcedures != undefined && this.lstClaimProcedures.length > 0) {

      this.lstClaimProcedures.forEach(proc => {

        let cptBalance: number = GeneralOperation.getCurrencyNumbersOnly(proc.cpt_balance);
        let cptPaidAmount = GeneralOperation.getCurrencyNumbersOnly(proc.paid_amount);
        let cptWriteOffAmount = GeneralOperation.getCurrencyNumbersOnly(proc.write_off);
        let cptPrevPaidAmount = GeneralOperation.getCurrencyNumbersOnly(proc.prev_paid_amount);
        let cptPrevWriteOffAmount = GeneralOperation.getCurrencyNumbersOnly(proc.prev_write_off);

        if (cptPaidAmount > 0) {
          this.totalPaymentToPost += Number(cptPaidAmount);
          this.totalPaymentToPost = Number(this.decimalPipe.transform(this.totalPaymentToPost, ".2-2", ""));
        }
        if (cptWriteOffAmount > 0) {
          this.totalWriteOffToPost += Number(cptWriteOffAmount);
          this.totalWriteOffToPost = Number(this.decimalPipe.transform(this.totalWriteOffToPost, ".2-2", ""));
        }

        if (cptPrevPaidAmount > 0) {
          this.totalPrevPaymentToPost += Number(cptPrevPaidAmount);
          this.totalPrevPaymentToPost = Number(this.decimalPipe.transform(this.totalPrevPaymentToPost, ".2-2", ""));
        }

        if (cptPrevWriteOffAmount > 0) {
          this.totalPrevWriteOffToPost += Number(cptPrevWriteOffAmount);
          this.totalPrevWriteOffToPost = Number(this.decimalPipe.transform(this.totalPrevWriteOffToPost, ".2-2", ""));
        }


        if (cptBalance < (cptPaidAmount + cptWriteOffAmount + cptPrevPaidAmount + cptPrevWriteOffAmount)) {
          proc.invalid = true;
        }
        else {
          proc.invalid = false;
        }
      });

    }
  }

  isFormValid(): boolean {

    let valid: boolean = true;

    if ((this.totalPendingPayment + this.totalPendingWriteOff + this.totalPendingPrevPayment + this.totalPendingPrevWriteOff) == 0
      || (this.totalPaymentToPost + this.totalWriteOffToPost + this.totalPrevPaymentToPost + this.totalPrevWriteOffToPost) == 0
      || (this.totalPaymentToPost > this.totalPendingPayment)
      || (this.totalWriteOffToPost > this.totalPendingWriteOff)
      || (this.totalPrevPaymentToPost > this.totalPendingPrevPayment)
      || (this.totalPrevWriteOffToPost > this.totalPendingPrevWriteOff)
    ) {
      valid = false;
    }
    return valid;

  }


  cashRegisterEntrySelectionChanged(cashReg: any) {
    //this.selectedCashRegisterId = cashReg.cash_register_id;
    this.assignValues(cashReg);
  }

  importPayment() {
    debugger;

    let lstClaimPaymentSave: Array<OrmClaimPaymentSave>;
    let lstKV: Array<ORMKeyValue>;

    if ((this.totalPendingPayment + this.totalPendingWriteOff + this.totalPendingPrevPayment + this.totalPendingPrevWriteOff)
      == (this.totalPaymentToPost + this.totalWriteOffToPost + this.totalPrevPaymentToPost + this.totalPrevWriteOffToPost)) {

      let ormKV: ORMKeyValue = new ORMKeyValue("RESOLVE_CASH_REGISTER_ENTRY", true);
      lstKV = new Array<ORMKeyValue>();
      lstKV.push(ormKV);
    }


    if (this.lstClaimProcedures != undefined) {

      let clientDateTime = this.dateTimeUtil.getCurrentDateTimeStringWithFormat(DateTimeFormat.DATEFORMAT_YYYY_MM_DD_HH_mm_ss_SSS);

      this.lstClaimProcedures.forEach(proc => {

        let paid: number = GeneralOperation.getCurrencyNumbersOnly(proc.paid_amount);
        let writeOffAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.write_off);
        let prevPaidAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.prev_paid_amount);
        let prevWriteOffAmount: number = GeneralOperation.getCurrencyNumbersOnly(proc.prev_write_off);

        if (paid > 0 || writeOffAmount > 0) {

          let objClaimPyment = new OrmClaimPaymentSave();

          objClaimPyment.claim_procedures_id = proc.claim_procedures_id;
          objClaimPyment.patient_id = this.openedClaimInfo.patientId;
          objClaimPyment.claim_id = this.openedClaimInfo.claimId;
          objClaimPyment.practice_id = this.lookupList.practiceInfo.practiceId;
          objClaimPyment.payment_source = "Patient";
          objClaimPyment.charged_procedure = proc.proc_code;
          objClaimPyment.paid_procedure = proc.proc_code;

          if (this.checkNo != null && this.checkNo != "") {
            objClaimPyment.check_date = this.checkDate;
            objClaimPyment.check_number = this.checkNo;
          }

          objClaimPyment.paid_amount = paid;
          objClaimPyment.writeoff_amount = writeOffAmount;

          objClaimPyment.eob_era_id = this.selectedCashRegisterId
          objClaimPyment.eob_era_id_type = "CASH_REGISTER";

          objClaimPyment.created_user = this.lookupList.logedInUser.user_name;
          objClaimPyment.client_date_created = clientDateTime;
          objClaimPyment.modified_user = this.lookupList.logedInUser.user_name;
          objClaimPyment.client_date_modified = clientDateTime;
          objClaimPyment.system_ip = this.lookupList.logedInUser.systemIp;

          objClaimPyment.entry_type = "Cash Register";

          if (lstClaimPaymentSave == undefined) {
            lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
          }
          lstClaimPaymentSave.push(objClaimPyment);
        }

        if (prevPaidAmount > 0 || prevWriteOffAmount > 0) {

          let objClaimPyment = new OrmClaimPaymentSave();

          objClaimPyment.claim_procedures_id = proc.claim_procedures_id;
          objClaimPyment.patient_id = this.openedClaimInfo.patientId;
          objClaimPyment.claim_id = this.openedClaimInfo.claimId;
          objClaimPyment.practice_id = this.lookupList.practiceInfo.practiceId;
          objClaimPyment.payment_source = "Patient";
          objClaimPyment.charged_procedure = proc.proc_code;
          objClaimPyment.paid_procedure = proc.proc_code;

          if (this.checkNo != null && this.checkNo != "") {
            objClaimPyment.check_date = this.checkDate;
            objClaimPyment.check_number = this.checkNo;
          }

          objClaimPyment.paid_amount = prevPaidAmount;
          objClaimPyment.writeoff_amount = prevWriteOffAmount;

          objClaimPyment.eob_era_id = this.selectedCashRegisterId
          objClaimPyment.eob_era_id_type = "CASH_REGISTER";

          objClaimPyment.created_user = this.lookupList.logedInUser.user_name;
          objClaimPyment.client_date_created = clientDateTime;
          objClaimPyment.modified_user = this.lookupList.logedInUser.user_name;
          objClaimPyment.client_date_modified = clientDateTime;
          objClaimPyment.system_ip = this.lookupList.logedInUser.systemIp;

          objClaimPyment.entry_type = "Previous Balance";

          if (lstClaimPaymentSave == undefined) {
            lstClaimPaymentSave = new Array<OrmClaimPaymentSave>();
          }
          lstClaimPaymentSave.push(objClaimPyment);
        }

      });


    }


    let wrapperClaimPaymentSave: WrapperClaimPaymentSave = new WrapperClaimPaymentSave(lstClaimPaymentSave, undefined, lstKV, undefined);

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

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', "There no amount to post.", AlertTypeEnum.INFO)

    }
  }

  onImportPayment() {

    if (this.validateData()) {

      let strMsg: string = "";
      this.lstClaimProcedures.forEach(proc => {
        if (proc.invalid) {
          if (strMsg != "") {
            strMsg += ", "
          }
          strMsg += proc.proc_code;
        }
      });

      if (strMsg != "") {

        const modalRef = this.ngbModal.open(ConfirmationPopupComponent, this.popUpOptions);
        modalRef.componentInstance.promptHeading = 'Confirm Deletion!';
        modalRef.componentInstance.promptMessage = "Payment/Write Off is Over Paid.<br>Do You want to continue?"
        modalRef.componentInstance.alertType = AlertTypeEnum.DANGER;

        modalRef.result.then((result) => {
          if (result == PromptResponseEnum.YES) {
            this.importPayment();
          }
        }, (reason) => {
        });
      }
      else {
        this.importPayment();
      }
    }
  }

  saveClaimPaymentSuccess(data: any) {
    if (data.status === ServiceResponseStatusEnum.SUCCESS) {
      this.activeModal.close(true);
    }
    else if (data.status === ServiceResponseStatusEnum.ERROR) {
      this.isLoading = false;
      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', data.response, AlertTypeEnum.DANGER)
    }
  }

  saveClaimPaymentError(error: any) {
    this.isLoading = false;
    GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash Register Payment', "An Error Occured while saving Patient Refund", AlertTypeEnum.DANGER)
  }



  validateData() {

    let strMsg: string = "";

    if (this.selectedCashRegisterId == undefined) {
      strMsg = "No Cash Register entry is selected."
    }

    else if ((this.totalPendingPayment + this.totalPendingWriteOff + this.totalPendingPrevPayment + this.totalPendingPrevWriteOff) == 0) {
      strMsg = "There is no pending amount in selected cash register."
    }

    else if ((this.totalPaymentToPost + this.totalWriteOffToPost + this.totalPrevPaymentToPost + this.totalPrevWriteOffToPost) == 0) {
      strMsg = "Please enter amount to post."
    }

    else if (this.totalPaymentToPost > this.totalPendingPayment) {
      strMsg = "Payment can't exceed cash register payment."
    }
    else if (this.totalWriteOffToPost > this.totalPendingWriteOff) {
      strMsg = "Write Off can't exceed cash register Write Off."
    }
    else if (this.totalPrevPaymentToPost > this.totalPendingPrevPayment) {
      strMsg = "Previous Payment can't exceed cash register payment."
    }
    else if (this.totalPrevWriteOffToPost > this.totalPendingPrevWriteOff) {
      strMsg = "Previous Write Off can't exceed cash register Write Off."
    }
    if (strMsg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash RegisterPayment', strMsg, AlertTypeEnum.DANGER)

      return false;
    }
    else {
      return true;
    }


    /*
    if (strMsg != "") {

      GeneralOperation.showAlertPopUp(this.ngbModal, 'Import Cash RegisterPayment', strMsg, AlertTypeEnum.DANGER)

      return false;
    }
    else {
      return true;
    }
    */

  }


}
